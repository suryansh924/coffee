import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db.client import get_supabase

def check_db():
    supabase = get_supabase()
    try:
        # Try to get one match to see columns
        res = supabase.table("matches").select("*").limit(1).execute()
        print("Matches table columns/data:", res.data)
        if res.data:
            print("Keys:", res.data[0].keys())
        else:
            print("Matches table is empty, cannot infer columns easily via select *")
            
            # Try to insert a dummy record with status to see if it fails
            try:
                dummy = {
                    "user_id": "test_user",
                    "match_user_id": "test_match",
                    "score": 0.5,
                    "status": "pending"
                }
                # We don't want to actually insert if possible, but upsert might be safe if we delete later
                # But better to just fail if column missing
                print("Attempting dummy upsert with status...")
                supabase.table("matches").upsert(dummy).execute()
                print("Upsert successful!")
            except Exception as e:
                print(f"Upsert failed: {e}")

    except Exception as e:
        print(f"Error checking DB: {e}")

if __name__ == "__main__":
    check_db()
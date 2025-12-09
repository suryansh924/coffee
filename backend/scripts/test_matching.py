import sys
import os
import json

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.client import get_supabase
from app.tools.trigger_matching import trigger_matching

def test_matching():
    supabase = get_supabase()
    
    # Get a random user to test with (skip test_user if it exists and causes UUID issues)
    res = supabase.table("users").select("user_id, name").neq("user_id", "test_user").limit(1).execute()
    if not res.data:
        print("No users found. Run seed_data.py first.")
        return

    user = res.data[0]
    print(f"🧪 Testing matching for: {user['name']} ({user['user_id']})")
    
    result = trigger_matching(user['user_id'])
    
    if result.get("status") == "success":
        print(f"✅ Matching successful! Found {len(result['matches'])} matches.")
        print(json.dumps(result['matches'][:3], indent=2))
    else:
        print(f"❌ Matching failed: {result.get('message')}")

if __name__ == "__main__":
    test_matching()

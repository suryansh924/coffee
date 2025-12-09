from app.db.client import get_supabase
from app.matching_engine import compute_matches_for_user

def trigger_matching(user_id: str):
    """
    Run the matching algorithm for a given user.
    Uses the advanced matching engine to compute scores and categories.
    """
    supabase = get_supabase()
    
    try:
        # 1. Compute matches using the engine
        result = compute_matches_for_user(user_id)
        
        if result.get("status") != "success":
            return result
            
        flat_matches = result["flat_matches"]
        
        # 2. Persist matches to DB
        # First, clear old matches for this user to avoid duplicates
        try:
            supabase.table("matches").delete().eq("user_id", user_id).execute()
        except Exception as e:
            print(f"Warning: Could not clear old matches: {e}")

        match_records = []
        for match in flat_matches:
            match_records.append({
                "user_id": user_id,
                "match_user_id": match["match_user_id"],
                "score": round(match["score"], 2)
            })
            
        if match_records:
            supabase.table("matches").insert(match_records).execute()
            
        return {"status": "success", "matches": flat_matches}
            
    except Exception as e:
        print(f"Error in matching: {e}")
        return {"status": "error", "message": str(e)}

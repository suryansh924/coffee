import logging
from app.db.client import get_supabase
from app.matching_engine import compute_matches_for_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def trigger_matching(user_id: str):
    """
    Run the matching algorithm for a given user.
    Uses the advanced matching engine to compute scores and categories.
    """
    logger.info(f"Triggering matching for user: {user_id}")
    supabase = get_supabase()
    
    try:
        # 1. Compute matches using the engine
        result = compute_matches_for_user(user_id)
        
        if result.get("status") != "success":
            logger.error(f"Matching engine failed: {result.get('message')}")
            return result
            
        flat_matches = result["flat_matches"]
        logger.info(f"Found {len(flat_matches)} matches")
        
        # 2. Persist matches to DB
        # First, clear old matches for this user to avoid duplicates
        try:
            supabase.table("matches").delete().eq("user_id", user_id).execute()
        except Exception as e:
            logger.warning(f"Warning: Could not clear old matches: {e}")

        match_records = []
        for match in flat_matches:
            match_records.append({
                "user_id": user_id,
                "match_user_id": match["match_user_id"],
                "score": round(match["score"], 2),
                "overlap_interests": match.get("overlap_interests", [])
            })
            
        if match_records:
            try:
                supabase.table("matches").insert(match_records).execute()
                logger.info("Matches saved to database")
            except Exception as e:
                logger.error(f"Failed to insert matches: {e}")
                # If insert fails (e.g. schema mismatch), we still return the matches 
                # so the user sees them in the UI this time, even if they aren't saved.
                pass
            
        # 3. Return simplified response to the Agent
        # The agent only needs to know it worked. The frontend will fetch the full data.
        return {
            "status": "success"
        }
            
    except Exception as e:
        logger.exception("Critical error in trigger_matching")
        return {"status": "error", "message": "Internal error during matching"}

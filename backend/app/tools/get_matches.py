from app.matching_engine import compute_matches_for_user

def get_matches(user_id: str, limit: int = 6):
    """
    Retrieve matches for the user from the Coffee backend.
    Directly uses the matching engine to compute matches on the fly.
    """
    try:
        result = compute_matches_for_user(user_id)
        
        if result.get("status") != "success":
            return result
            
        # Return the top N matches from the flat list
        flat_matches = result["flat_matches"][:limit]
        
        # Format them to match what the frontend expects
        formatted_matches = []
        for m in flat_matches:
            formatted_matches.append({
                "user_id": m["match_user_id"],
                "name": m.get("name"),
                "age": m.get("age"),
                "city": m.get("city"),
                "match_reason": m.get("tagline") or (f"Interests: {', '.join((m.get('overlap_interests') or [])[:3])}" if (m.get('overlap_interests') or []) else "Great match!"),
                "score": m["score"], # 0-1 score from engine
                "overlap_interests": (m.get("overlap_interests") or [])[:5]
            })
            print(formatted_matches[-1])
            
        return {"status": "success", "matches": formatted_matches}
            
    except Exception as e:
        print(f"Error fetching matches: {e}")
        return {"status": "error", "message": str(e)}

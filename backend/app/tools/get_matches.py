from app.db.client import get_supabase

def get_matches(user_id: str, limit: int = 10):
    """
    Retrieve matches for the user from the Coffee backend.
    """
    supabase = get_supabase()
    
    try:
        # Join matches with users table to get profile details
        # Supabase-py doesn't support complex joins easily in one go like SQL, 
        # but we can select from matches and then fetch user details or use the foreign key syntax if configured.
        # Let's try the foreign key syntax: select(*, match_user:users(*))
        
        response = supabase.table("matches")\
            .select("*, match_user:users!match_user_id(*)")\
            .eq("user_id", user_id)\
            .order("score", desc=True)\
            .limit(limit)\
            .execute()
            
        formatted_matches = []
        
        for record in response.data:
            match_user = record.get("match_user")
            if not match_user:
                continue
                
            formatted_matches.append({
                "match_user_id": record["match_user_id"],
                "name": match_user.get("name"),
                "age": match_user.get("age"),
                "city": match_user.get("city"),
                "tagline": match_user.get("tagline"),
                "score": record["score"],
                "overlap_interests": record["overlap_interests"]
            })
            
        return {"status": "success", "matches": formatted_matches}
            
    except Exception as e:
        print(f"Error fetching matches: {e}")
        return {"status": "error", "message": str(e)}

from app.db.client import get_supabase

def get_user_profile(user_id: str):
    """
    Retrieves the user's profile from the database.
    """
    supabase = get_supabase()
    
    try:
        response = supabase.table("users").select("*").eq("user_id", user_id).execute()
        
        if response.data:
            return {"status": "success", "profile": response.data[0]}
        else:
            return {"status": "success", "profile": None} # User not found is not an error
            
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return {"status": "error", "message": str(e)}

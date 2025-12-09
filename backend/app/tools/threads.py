from pydantic import BaseModel
from app.db.client import get_supabase

class SaveThreadRequest(BaseModel):
    user_id: str
    thread_id: str
    title: str | None = None

def save_thread(user_id: str, thread_id: str, title: str | None = None):
    """
    Links a ChatKit thread to a user.
    """
    supabase = get_supabase()
    
    try:
        data = {
            "user_id": user_id,
            "thread_id": thread_id,
            "updated_at": "now()"
        }
        if title:
            data["title"] = title
            
        # Upsert thread
        response = supabase.table("threads").upsert(data).execute()
        return {"status": "success", "data": response.data}
            
    except Exception as e:
        print(f"Error saving thread: {e}")
        return {"status": "error", "message": str(e)}

def get_user_threads(user_id: str):
    """
    Gets all threads for a user.
    """
    supabase = get_supabase()
    try:
        response = supabase.table("threads").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching threads: {e}")
        return []

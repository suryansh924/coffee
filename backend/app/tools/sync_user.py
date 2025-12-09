from pydantic import BaseModel
from app.db.client import get_supabase

class SyncUserRequest(BaseModel):
    user_id: str
    email: str | None = None
    phone: str | None = None

def sync_user(user_id: str, email: str | None = None, phone: str | None = None):
    """
    Ensures the user exists in the public.users table.
    """
    supabase = get_supabase()
    
    try:
        # Check if user exists
        existing = supabase.table("users").select("user_id").eq("user_id", user_id).execute()
        
        if not existing.data:
            # Insert new user
            data = {"user_id": user_id}
            if email:
                data["email"] = email
            if phone:
                data["phone"] = phone
            
            response = supabase.table("users").insert(data).execute()
            return {"status": "created", "data": response.data}
        else:
            # Update email/phone if provided
            updates = {}
            if email:
                updates["email"] = email
            if phone:
                updates["phone"] = phone
            
            if updates:
                supabase.table("users").update(updates).eq("user_id", user_id).execute()
            return {"status": "exists"}
            
    except Exception as e:
        print(f"Error syncing user: {e}")
        return {"status": "error", "message": str(e)}

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.db.client import get_supabase

class ProfileAttributes(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    age_range: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    interests: Optional[List[str]] = None
    personality_traits: Optional[List[str]] = None
    looking_for: Optional[List[str]] = None
    meeting_preferences: Optional[str] = None
    dealbreakers: Optional[List[str]] = None
    tagline: Optional[str] = None

class SaveProfileSectionRequest(BaseModel):
    user_id: str
    attributes: ProfileAttributes

def save_profile_section(user_id: str, attributes: Dict[str, Any]):
    """
    Saves or updates a section of the user's profile.
    """
    supabase = get_supabase()
    
    # Filter out None values to avoid overwriting existing data with nulls if not intended
    # But for upsert, we usually want to merge. Supabase upsert replaces the row if we don't be careful.
    # However, if we just want to update specific fields, we should use 'update' if the user exists, or 'insert' if not.
    # Or we can use upsert with ignore_duplicates=False (default).
    
    # Ideally, we check if user exists first.
    
    data = {k: v for k, v in attributes.items() if v is not None}
    data["user_id"] = user_id
    
    # Check if user exists
    try:
        existing = supabase.table("users").select("user_id").eq("user_id", user_id).execute()
        
        if existing.data:
            # Update
            response = supabase.table("users").update(data).eq("user_id", user_id).execute()
        else:
            # Insert
            response = supabase.table("users").insert(data).execute()
            
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"Error saving profile: {e}")
        return {"status": "error", "message": str(e)}

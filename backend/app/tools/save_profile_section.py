from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.db.client import get_supabase
from app.tools.generate_embedding import generate_embedding

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

def build_profile_text(u: Dict[str, Any]) -> str:
    parts = []
    if u.get("name"): parts.append(f"Name: {u['name']}")
    if u.get("age"): parts.append(f"Age: {u['age']}")
    if u.get("age_range"): parts.append(f"Age range: {u['age_range']}")
    if u.get("gender"): parts.append(f"Gender: {u['gender']}")
    if u.get("city") or u.get("area"):
        parts.append(f"Location: {(u.get('area') or '').strip()} {(u.get('city') or '').strip()}".strip())
    if u.get("occupation"): parts.append(f"Occupation: {u['occupation']}")
    if u.get("interests"): parts.append(f"Interests: {', '.join(u['interests'])}")
    if u.get("personality_traits"): parts.append(f"Personality: {', '.join(u['personality_traits'])}")
    if u.get("looking_for"): parts.append(f"Looking for: {', '.join(u['looking_for'])}")
    if u.get("meeting_preferences"): parts.append(f"Meeting preferences: {u['meeting_preferences']}")
    if u.get("dealbreakers"): parts.append(f"Dealbreakers: {', '.join(u['dealbreakers'])}")
    if u.get("tagline"): parts.append(f"Tagline: {u['tagline']}")
    return "\n".join(parts).strip()

def should_embed(u: Dict[str, Any]) -> bool:
    return bool(
        (u.get("interests") and len(u["interests"]) > 0) or
        (u.get("personality_traits") and len(u["personality_traits"]) > 0) or
        (u.get("looking_for") and len(u["looking_for"]) > 0) or
        u.get("tagline") or
        u.get("occupation")
    )

def save_profile_section(user_id: str, attributes: Dict[str, Any]):
    supabase = get_supabase()
    data = {k: v for k, v in attributes.items() if v is not None}
    data["user_id"] = user_id

    try:
        existing = supabase.table("users").select("user_id").eq("user_id", user_id).execute()

        if existing.data:
            response = supabase.table("users").update(data).eq("user_id", user_id).execute()
        else:
            response = supabase.table("users").insert(data).execute()

        # fetch fresh row
        user_row_res = supabase.table("users").select("*").eq("user_id", user_id).single().execute()
        user_row = user_row_res.data or {}

        # embed + write
        if should_embed(user_row):
            profile_text = build_profile_text(user_row)
            emb = generate_embedding(profile_text)
            if emb:
                supabase.table("users").update({"embedding": emb}).eq("user_id", user_id).execute()

        return {"status": "success", "data": response.data}

    except Exception as e:
        print(f"Error saving profile: {e}")
        return {"status": "error", "message": str(e)}

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
import os
import json
import uuid
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.tools.save_profile_section import save_profile_section, SaveProfileSectionRequest
from app.tools.get_user_profile import get_user_profile
from app.tools.trigger_matching import trigger_matching
from app.tools.get_matches import get_matches
from app.tools.sync_user import sync_user, SyncUserRequest
from app.tools.threads import save_thread, get_user_threads, SaveThreadRequest

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
CHATKIT_WORKFLOW_ID = os.environ.get("CHATKIT_WORKFLOW_ID")

class SessionRequest(BaseModel):
    user_id: str | None = None

@app.post("/api/users/sync")
def api_sync_user(request: SyncUserRequest):
    return sync_user(request.user_id, request.email, request.phone)

@app.post("/api/threads")
def api_save_thread(request: SaveThreadRequest):
    return save_thread(request.user_id, request.thread_id, request.title)

@app.get("/api/threads/{user_id}")
def api_get_threads(user_id: str):
    return get_user_threads(user_id)

@app.post("/api/chatkit/session")
def create_chatkit_session(request: SessionRequest):
    if not CHATKIT_WORKFLOW_ID:
        raise HTTPException(status_code=500, detail="CHATKIT_WORKFLOW_ID not configured")
    
    try:
        user_id = request.user_id or f"user_{uuid.uuid4().hex[:16]}"
        
        # Ensure user exists if we have a real ID
        if request.user_id:
            sync_user(request.user_id)

        # Fetch user profile to inject as context
        profile_context = "{}"
        if request.user_id:
            profile_res = get_user_profile(request.user_id)
            if profile_res.get("status") == "success" and profile_res.get("profile"):
                profile_context = json.dumps(profile_res.get("profile"))
                print(f"✅ Injected profile context for {request.user_id}: {profile_context[:100]}...")
            else:
                print(f"⚠️ No profile found for {request.user_id}, injecting empty context.")

        session_payload = {
            "workflow": {
                "id": CHATKIT_WORKFLOW_ID,
                "state_variables": {
                    "user_profile_context": profile_context
                }
            },
            "user": user_id
        }
        
        # Handle beta namespace if necessary
        if hasattr(client, 'beta') and hasattr(client.beta, 'chatkit'):
            session = client.beta.chatkit.sessions.create(**session_payload)
        else:
            session = client.chatkit.sessions.create(**session_payload)
        
        return {"client_secret": session.client_secret, "user_id": user_id}
    except Exception as e:
        print(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Coffee Backend is running"}

@app.post("/api/tools/save_profile_section")
def tool_save_profile_section(request: SaveProfileSectionRequest):
    return save_profile_section(request.user_id, request.attributes.dict())

@app.get("/api/tools/get_user_profile/{user_id}")
def tool_get_user_profile(user_id: str):
    return get_user_profile(user_id)

@app.post("/api/tools/trigger_matching/{user_id}")
def tool_trigger_matching(user_id: str):
    return trigger_matching(user_id)

@app.get("/api/tools/get_matches/{user_id}")
def tool_get_matches(user_id: str, limit: int = 10):
    return get_matches(user_id, limit)

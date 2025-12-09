import sys
import os
import json
import uuid
import time

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.client import get_supabase
from app.tools.trigger_matching import trigger_matching
from app.tools.generate_embedding import generate_embedding

def test_matching_with_new_user():
    supabase = get_supabase()
    
    # 1. Define a new user profile
    new_user_id = str(uuid.uuid4())
    name = "OpenAI Test User"
    
    profile_data = {
        "user_id": new_user_id,
        "name": name,
        "age": 28,
        "gender": "Male",
        "city": "Bangalore",
        "tagline": "Testing the real embeddings flow. I love coding, coffee, and testing AI agents.",
        "interests": ["Coding", "Coffee", "AI", "Debugging"],
        "personality_traits": ["Analytical", "Curious", "Persistent"],
        "looking_for": ["Friendship", "Networking"],
        "meeting_preferences": "Coffee Shop",
        "dealbreakers": ["Cobol"]
    }
    
    # 2. Generate Embedding
    print(f"🧠 Generating embedding for {name}...")
    
    # Construct text for embedding
    text_to_embed = f"""
    Name: {profile_data['name']}
    Tagline: {profile_data['tagline']}
    Interests: {', '.join(profile_data['interests'])}
    Personality: {', '.join(profile_data['personality_traits'])}
    Looking For: {', '.join(profile_data['looking_for'])}
    """
    
    embedding = generate_embedding(text_to_embed)
    
    if not embedding:
        print("❌ Failed to generate embedding. Check OpenAI API Key.")
        return

    print("✅ Embedding generated successfully.")
    
    # Add embedding to profile data
    # Note: Supabase vector column expects a list of floats, but the client might need it as a string or list depending on the library version.
    # Based on previous debugging, we know the matching engine handles strings or lists, but insertion via supabase-py usually works with lists.
    profile_data["embedding"] = embedding

    # 3. Insert User into DB
    print(f"💾 Saving user {new_user_id} to database...")
    try:
        supabase.table("users").insert(profile_data).execute()
        print("✅ User saved.")
    except Exception as e:
        print(f"❌ Failed to save user: {e}")
        return

    # 4. Trigger Matching
    print(f"🧪 Triggering matching for: {name} ({new_user_id})")
    result = trigger_matching(new_user_id)
    
    if result.get("status") == "success":
        print(f"✅ Matching successful! Found {len(result['matches'])} matches.")
        print(json.dumps(result['matches'][:3], indent=2))
        
        # Verify that we got semantic scores (should be non-zero if embedding worked)
        semantic_scores = [m["semantic_score"] for m in result["matches"]]
        avg_semantic = sum(semantic_scores) / len(semantic_scores) if semantic_scores else 0
        print(f"📊 Average Semantic Score: {avg_semantic:.4f}")
        
    else:
        print(f"❌ Matching failed: {result.get('message')}")

if __name__ == "__main__":
    test_matching_with_new_user()

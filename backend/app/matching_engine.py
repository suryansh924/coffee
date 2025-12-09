import numpy as np
import os
import json
from app.db.client import get_supabase
from app.tools.get_user_profile import get_user_profile

# ---------------------------
# Helper Functions
# ---------------------------

def jaccard(a, b):
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    inter = sa & sb
    union = sa | sb
    if not union:
        return 0.0
    return len(inter) / len(union)


def parse_embedding(emb):
    if emb is None:
        return []
    if isinstance(emb, str):
        try:
            return json.loads(emb)
        except:
            return []
    return emb

def cosine_similarity(a, b):
    # Parse if strings
    a = parse_embedding(a)
    b = parse_embedding(b)
    
    # If embeddings are missing or empty, return 0
    if a is None or b is None:
        return 0.0
    if isinstance(a, (list, tuple)) and len(a) == 0:
        return 0.0
    if isinstance(b, (list, tuple)) and len(b) == 0:
        return 0.0
        
    try:
        a = np.array(a, dtype=float)
        b = np.array(b, dtype=float)
    except Exception:
        return 0.0

    if a.size == 0 or b.size == 0:
        return 0.0

    a_norm = np.linalg.norm(a) or 1.0
    b_norm = np.linalg.norm(b) or 1.0

    cosine = float(np.dot(a, b) / (a_norm * b_norm))
    # Normalize from [-1,1] to [0,1]
    return (cosine + 1) / 2


def top_n(items, key, n=5):
    return sorted(items, key=lambda x: x[key], reverse=True)[:n]


def conflict_with_dealbreakers(user_dealbreakers, candidate):
    """
    If ANY dealbreaker matches ANY attribute of the candidate → reject.
    """
    if not user_dealbreakers:
        return False

    db = set(user_dealbreakers)
    attrs = (
        set(candidate.get("interests") or []) |
        set(candidate.get("personality_traits") or []) |
        set(candidate.get("looking_for") or [])
    )

    return len(db & attrs) > 0


# ---------------------------
# Main Matching Engine
# ---------------------------

def compute_matches_for_user(user_id: str):
    """
    Returns both:
    - Classified match groups
    - A unified flat match list
    """
    supabase = get_supabase()

    # -----------------------------------
    # 1. Get user profile
    # -----------------------------------
    user_profile_res = get_user_profile(user_id)
    if user_profile_res.get("status") != "success":
        return {"status": "error", "message": "User profile not found"}

    profile = user_profile_res["profile"]
    if not profile:
        return {"status": "error", "message": "User profile is empty"}

    if isinstance(profile, str):
        try:
            profile = json.loads(profile)
        except:
            return {"status": "error", "message": "User profile is corrupted"}

    if not isinstance(profile, dict):
        return {"status": "error", "message": "User profile format error"}

    # -----------------------------------
    # 2. Ensure embedding exists
    # -----------------------------------
    user_embedding = profile.get("embedding")
    if not user_embedding:
        # Fallback if no embedding is present
        user_embedding = [0.0] * 1536

    # -----------------------------------
    # 3. Get candidate profiles
    # -----------------------------------
    # Fetch all other users
    candidates_res = supabase.table("users").select("*").neq("user_id", user_id).execute()
    candidates = candidates_res.data

    matches = []

    # -----------------------------------
    # Intermediate values
    # -----------------------------------
    city = profile.get("city")
    interests = profile.get("interests") or []
    personality = profile.get("personality_traits") or []
    looking_for = profile.get("looking_for") or []
    meeting_pref = profile.get("meeting_preferences") or ""
    dealbreakers = profile.get("dealbreakers") or []

    # Convert embedding to vector
    user_embedding = parse_embedding(user_embedding)
    user_vec = np.array(user_embedding, dtype=float)

    # -----------------------------------
    # 4. Evaluate each candidate
    # -----------------------------------
    for candidate in candidates:
        c_id = candidate.get("user_id")
        c_name = candidate.get("name")
        c_age = candidate.get("age")
        c_city = candidate.get("city")
        c_tagline = candidate.get("tagline")
        c_interests = candidate.get("interests")
        c_looking_for = candidate.get("looking_for")
        c_personality = candidate.get("personality_traits")
        c_meeting_pref = candidate.get("meeting_preferences")
        c_embedding = candidate.get("embedding") or [0.0] * 1536 # Placeholder

        # ----- Dealbreaker filter -----
        candidate_profile_check = {
            "interests": c_interests,
            "personality_traits": c_personality,
            "looking_for": c_looking_for,
        }

        if conflict_with_dealbreakers(dealbreakers, candidate_profile_check):
            continue

        # ----- Compute category scores -----
        semantic = cosine_similarity(user_vec, c_embedding)
        interest_score = jaccard(interests, c_interests)
        personality_score = jaccard(personality, c_personality)
        activity_score = jaccard([meeting_pref], [c_meeting_pref]) if meeting_pref and c_meeting_pref else 0.0
        location_score = 1.0 if c_city == city else 0.0

        # Calculate a composite score for the main display
        # Weighted average: 30% Interest, 30% Semantic, 20% Location, 20% Personality
        composite_score = (
            (interest_score * 0.3) + 
            (semantic * 0.3) + 
            (location_score * 0.2) + 
            (personality_score * 0.2)
        )

        matches.append({
            "match_user_id": c_id,
            "name": c_name,
            "age": c_age,
            "city": c_city,
            "tagline": c_tagline,
            "overlap_interests": list(set(interests) & set(c_interests or [])),
            "semantic_score": semantic,
            "interest_score": interest_score,
            "activity_score": activity_score,
            "personality_score": personality_score,
            "location_score": location_score,
            "score": composite_score # For backward compatibility with widget
        })

    # -----------------------------------
    # 5. Category-based diversification
    # -----------------------------------
    location_based     = top_n(matches, "location_score", 5)
    interest_based     = top_n(matches, "interest_score", 5)
    activity_based     = top_n(matches, "activity_score", 5)
    personality_based  = top_n(matches, "personality_score", 5)
    overall_vibe       = top_n(matches, "semantic_score", 5)

    # -----------------------------------
    # 6. Merge into unique flat list
    # -----------------------------------
    seen = set()
    flat = []

    def add_unique(block):
        for m in block:
            if m["match_user_id"] not in seen:
                seen.add(m["match_user_id"])
                flat.append(m)

    # Prioritize overall vibe and interests for the flat list
    add_unique(overall_vibe)
    add_unique(interest_based)
    add_unique(location_based)
    add_unique(personality_based)
    add_unique(activity_based)

    # -----------------------------------
    # 7. Final structured result
    # -----------------------------------
    return {
        "status": "success",
        "classified_matches": {
            "location_based": location_based,
            "interest_based": interest_based,
            "activity_based": activity_based,
            "personality_based": personality_based,
            "overall_vibe": overall_vibe,
        },
        "flat_matches": flat,
    }

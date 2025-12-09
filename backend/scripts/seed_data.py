import sys
import os
import random
import uuid

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.client import get_supabase

# Mock Data Pools
NAMES = [
    "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Muhammad", "Rohan", "Krishna", "Ishaan",
    "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Kiara", "Myra", "Riya", "Fatima", "Zara",
    "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Neha", "Suresh", "Pooja", "Karthik", "Anjali"
]

AREAS = ["Indiranagar", "Koramangala", "HSR Layout", "Whitefield", "Jayanagar", "JP Nagar", "Malleshwaram"]

OCCUPATIONS = [
    "Software Engineer", "Product Manager", "Designer", "Data Scientist", "Founder", 
    "Marketing Specialist", "Content Creator", "Student", "Architect", "Consultant"
]

INTERESTS = [
    "Coffee", "Hiking", "Reading", "Tech", "Startups", "Yoga", "Photography", 
    "Foodie", "Travel", "Music", "Movies", "Board Games", "Badminton", "Cricket", 
    "Art", "Cooking", "Dancing", "Writing"
]

TRAITS = [
    "Introvert", "Extrovert", "Chill", "Energetic", "Creative", "Analytical", 
    "Ambitious", "Kind", "Funny", "Thoughtful", "Adventurous"
]

LOOKING_FOR = [
    "Friends", "Networking", "Dating", "Activity Partners", "Mentorship"
]

TAGLINES = [
    "Always looking for the best coffee in town.",
    "Tech enthusiast and weekend hiker.",
    "Love to explore new places and meet new people.",
    "Building the next big thing.",
    "Just here for the vibes.",
    "Bookworm and cat lover.",
    "Let's grab a coffee and talk about life.",
    "Badminton on weekends?",
    "Foodie looking for a dining partner.",
    "Startup founder looking to network."
]

def seed_users(count=30):
    supabase = get_supabase()
    print(f"🌱 Seeding {count} mock users...")

    # Clear existing users to ensure clean state with valid UUIDs
    try:
        # Delete all users (using a condition that is always true for UUIDs or strings)
        # Note: This might fail if there are foreign key constraints from other tables (like matches)
        # So we should clear matches first if possible, but we can't easily.
        # Let's try to delete users.
        supabase.table("users").delete().neq("user_id", "placeholder").execute()
        print("🧹 Cleared existing users.")
    except Exception as e:
        print(f"⚠️ Could not clear users (might be FK constraints): {e}")

    users = []
    for _ in range(count):
        name = random.choice(NAMES)
        user_id = str(uuid.uuid4())
        
        profile = {
            "user_id": user_id,
            "name": name,
            "age": random.randint(21, 35),
            "city": "Bangalore",
            "area": random.choice(AREAS),
            "gender": random.choice(["Male", "Female", "Non-binary"]),
            "occupation": random.choice(OCCUPATIONS),
            "interests": random.sample(INTERESTS, k=random.randint(3, 6)),
            "personality_traits": random.sample(TRAITS, k=random.randint(2, 4)),
            "looking_for": random.sample(LOOKING_FOR, k=random.randint(1, 3)),
            "tagline": random.choice(TAGLINES),
            "email": f"{name.lower()}{random.randint(1,99)}@example.com",
            "phone": f"+919{random.randint(100000000, 999999999)}",
            # Mock embedding (1536 dimensions)
            "embedding": [random.uniform(-0.1, 0.1) for _ in range(1536)]
        }
        
        users.append(profile)

    success_count = 0
    for user in users:
        try:
            res = supabase.table("users").upsert(user).execute()
            success_count += 1
        except Exception as e:
            print(f"❌ Failed to insert {user['name']}: {e}")

    print(f"✅ Successfully seeded {success_count} users.")

if __name__ == "__main__":
    seed_users()

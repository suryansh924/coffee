# ☕ Coffee -- AI Social Discovery App

Coffee is a **chat-first social discovery app** where users build rich
profiles by talking to **Ella**, an AI concierge. Ella learns about the
user, saves their profile, and suggests interesting people nearby to
meet in safe offline settings (cafes, public spots).

This repository contains the full stack implementation:

-   **Frontend** -- React + ChatKit + Supabase Auth\
-   **Backend** -- FastAPI + Postgres/Supabase + pgvector\
-   **AI** -- Agent Builder workflow for "Ella" + custom matching
-   **Widgets** -- React-based UI widgets for matches and
    multiple-choice options

------------------------------------------------------------------------

## 🔧 Tech Stack

### Frontend

-   React (Vite)
-   `@openai/chatkit-react`
-   ShadCN UI + Tailwind
-   Supabase Auth (email/phone OTP)
-   Custom React widgets (matches, profile options)

### Backend

-   FastAPI (Python)
-   OpenAI Python SDK (ChatKit + Embeddings)
-   Postgres (or Supabase) + pgvector
-   Tools for profile, matching, threads

### AI / Agents

-   OpenAI Agent Builder workflow ("Ella")
-   State variables (profile context, session params)
-   Tool calling for:
    -   profile storage
    -   fetching profiles
    -   triggers matching
    -   displaying widgets
    -   opening profiles or P2P chat

### Matching Engine

-   Embeddings (`text-embedding-3-large`)
-   Cosine similarity
-   Jaccard interest overlap
-   Personality + meeting-style matching
-   Dealbreaker filters
-   Diversified output: location, interests, activities, personality,
    vibe

------------------------------------------------------------------------

## 🧱 Architecture

``` text
[ Web / Mobile Client ]
       |
       v
[ ChatKit UI ] — per-user LLm session
       |
       v
[ Ella (Agent Builder Workflow) ]
       |
       | backend tools
       v
[ FastAPI Backend ]
       |
       v
[ Postgres / Supabase + pgvector ]
```

### Where data lives

  Layer              Stored Where
  ------------------ -----------------------------
  Chat history       ChatKit (OpenAI-hosted)
  User profile       Your DB (Postgres/Supabase)
  Embeddings         DB (vector column)
  Thread metadata    Your DB
  Matching results   Generated on demand

------------------------------------------------------------------------

## 📂 Repo Structure

``` text
coffee/
  frontend/
    src/
      pages/Ella.tsx
      components/widgets/
        MatchesWidget.tsx
        ProfileOptionsWidget.tsx
      lib/chatkit-ui.config.ts
      lib/supabase.ts
  backend/
    app/
      main.py
      tools/
        save_profile_section.py
        get_user_profile.py
        trigger_matching.py
        get_matches.py
        sync_user.py
        threads.py
      db/
        schema.sql
        embeddings.py
        matching_engine.py
  agent/
    ella.md
    tools.json
  docs/
    INSTRUCTIONS.md
```

------------------------------------------------------------------------

## 🧪 Local Setup

### 1. Environment

**Install prerequisites:** - Node 20+ - Python 3.11+ - Postgres /
Supabase - OpenAI API Key - pgvector extension enabled

------------------------------------------------------------------------

### 2. Backend

``` bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env`:

``` env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgres://...
CHATKIT_WORKFLOW_ID=wf_...

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
```

Run schema:

``` bash
psql $DATABASE_URL -f app/db/schema.sql
```

Run backend:

``` bash
uvicorn app.main:app --reload --port 8000
```

------------------------------------------------------------------------

### 3. Frontend

``` bash
cd frontend
npm install
```

Create `.env`:

``` env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

VITE_CHATKIT_WORKFLOW_ID=wf_...
VITE_CHATKIT_SESSION_ENDPOINT=/api/chatkit/session
```

Run app:

``` bash
npm run dev
```

Visit: `http://localhost:5173`

------------------------------------------------------------------------

## 🤖 Agent Setup (Ella)

In Agent Builder:

1.  Create workflow "Ella"\
2.  Paste `agent/ella.md` into System Prompt\
3.  Add tools via `tools.json`:
    -   **Backend tools** (HTTP URLs)
        -   `save_profile_section`
        -   `get_user_profile`
        -   `trigger_matching`
        -   `get_matches`
    -   **Client tools** (handled in frontend)
        -   `show_matches_widget`
        -   `show_profile_builder_options`
        -   `update_profile_progress`
        -   `open_match_profile`
        -   `open_p2p_chat`
4.  In Start node, define state variables:
    -   `user_profile_context` (string)
    -   optional: `current_location`, `entry_source`
5.  Publish and use the workflow ID in backend/frontend config.

------------------------------------------------------------------------

## 🧬 Matching Engine

Located in:

-   `backend/app/tools/generate_embedding.py`
-   `backend/app/matching_engine.py`
-   `backend/app/tools/trigger_matching.py`

### Features:

-   Dealbreaker filtering\
-   Embedding similarity (cosine)\
-   Interest overlap\
-   Personality matching\
-   Activity / meeting-style matching\
-   Location bias\
-   Categorized output (5 per category)

Returns:

``` json
{
  "classified_matches": {
    "location_based": [...],
    "interest_based": [...],
    "activity_based": [...],
    "personality_based": [...],
    "overall_vibe": [...]
  },
  "flat_matches": [...]
}
```

Ella converts `flat_matches` into your Match Widget.

------------------------------------------------------------------------

## Developer Notes

### If building a **native mobile app**:

You only need to:

1.  Authenticate the user (Supabase or another provider)\
2.  Call `POST /api/chatkit/session` with `user_id` to get
    `client_secret`\
3.  Use any ChatKit-compatible client\
4.  Implement the same **client tools**:
    -   `show_matches_widget`
    -   `show_profile_builder_options`
    -   `open_match_profile`
    -   `open_p2p_chat`

Everything else is backend-driven.# coffee
# coffee

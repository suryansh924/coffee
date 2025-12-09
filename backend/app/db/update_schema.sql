-- Run this in your Supabase SQL Editor to update the database schema

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN
IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN
IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN
IF NOT EXISTS embedding vector
(1536);

-- 2. Create threads table if it doesn't exist
CREATE TABLE
IF NOT EXISTS threads
(
    thread_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users
(user_id),
    title TEXT,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create matches table if it doesn't exist
CREATE TABLE
IF NOT EXISTS matches
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    user_id TEXT REFERENCES users
(user_id),
    match_user_id TEXT REFERENCES users
(user_id),
    score FLOAT,
    status TEXT DEFAULT 'pending',
    overlap_interests TEXT[],
    match_reason TEXT,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE
(user_id, match_user_id)
);

-- 4. Add missing columns to matches table if it already exists
ALTER TABLE matches ADD COLUMN
IF NOT EXISTS overlap_interests TEXT[];
ALTER TABLE matches ADD COLUMN
IF NOT EXISTS match_reason TEXT;
ALTER TABLE matches ADD COLUMN
IF NOT EXISTS status TEXT DEFAULT 'pending';);

-- 3. Grant permissions (if needed, usually authenticated/anon roles need access if using direct client, 
-- but here we use service_role/backend so it should be fine. 
-- However, if you use RLS, you might need policies. For now we assume service role bypasses RLS or RLS is off).

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT,
    phone TEXT,
    name TEXT,
    age INTEGER,
    age_range TEXT,
    city TEXT,
    area TEXT,
    gender TEXT,
    occupation TEXT,
    interests TEXT[], -- Array of strings
    personality_traits TEXT[], -- Array of strings
    looking_for TEXT[], -- Array of strings
    meeting_preferences TEXT,
    dealbreakers TEXT[], -- Array of strings
    tagline TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Embedding for matching (e.g. 1536 dimensions for OpenAI text-embedding-3-small)
    embedding vector(1536)
);

-- Create an index for faster vector similarity search
CREATE INDEX IF NOT EXISTS users_embedding_idx ON users USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Threads table (Links ChatKit threads to Users)
CREATE TABLE IF NOT EXISTS threads (
    thread_id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(user_id),
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(user_id),
    match_user_id TEXT REFERENCES users(user_id),
    score FLOAT,
    overlap_interests TEXT[],
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, match_user_id)
);

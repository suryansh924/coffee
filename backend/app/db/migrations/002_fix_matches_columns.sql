-- Fix matches table columns to be TEXT to match users table
-- This handles cases where user_id might not be a valid UUID (e.g. if not using Supabase Auth UUIDs)
-- and ensures consistency with the users table definition.

BEGIN;

    -- Alter columns to TEXT. UUID to TEXT conversion is implicit/safe.
    ALTER TABLE matches 
ALTER COLUMN user_id TYPE
    TEXT;

    ALTER TABLE matches 
ALTER COLUMN match_user_id TYPE
    TEXT;

    COMMIT;

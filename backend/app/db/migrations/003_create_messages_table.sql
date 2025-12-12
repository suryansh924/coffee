-- Create messages table for P2P chat
CREATE TABLE
IF NOT EXISTS messages
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    sender_id TEXT REFERENCES users
(user_id),
    receiver_id TEXT REFERENCES users
(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX
IF NOT EXISTS messages_sender_receiver_idx ON messages
(sender_id, receiver_id);
CREATE INDEX
IF NOT EXISTS messages_receiver_sender_idx ON messages
(receiver_id, sender_id);

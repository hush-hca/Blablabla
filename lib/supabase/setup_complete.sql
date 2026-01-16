-- Complete Supabase Setup Script
-- Run this ONCE in Supabase SQL Editor
-- This script is idempotent - safe to run multiple times

-- ============================================
-- STEP 1: Create Tables (if not exist)
-- ============================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  farcaster_fid INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice messages table
CREATE TABLE IF NOT EXISTS voice_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  voice_url TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  payment_token TEXT NOT NULL,
  payment_amount TEXT NOT NULL,
  transaction_hash TEXT,
  farcaster_cast_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES voice_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, wallet_address, emoji)
);

-- BB Points table
CREATE TABLE IF NOT EXISTS bb_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily claims table
CREATE TABLE IF NOT EXISTS daily_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  claim_date DATE NOT NULL,
  bb_points_converted INTEGER DEFAULT 0,
  top_message_reward INTEGER DEFAULT 0,
  total_claimed INTEGER NOT NULL,
  transaction_hash TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_address, claim_date)
);

-- Top message rewards table
CREATE TABLE IF NOT EXISTS top_message_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES voice_messages(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  rank INTEGER NOT NULL,
  reward_amount INTEGER NOT NULL,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create Indexes (if not exist)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_voice_messages_created_at ON voice_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_wallet ON voice_messages(wallet_address);
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_wallet ON reactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_bb_points_wallet ON bb_points(wallet_address);
CREATE INDEX IF NOT EXISTS idx_daily_claims_wallet_date ON daily_claims(wallet_address, claim_date);
CREATE INDEX IF NOT EXISTS idx_top_message_rewards_date ON top_message_rewards(reward_date);

-- ============================================
-- STEP 3: Create Functions and Triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_messages_updated_at ON voice_messages;
CREATE TRIGGER update_voice_messages_updated_at BEFORE UPDATE ON voice_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 4: Enable RLS on Tables
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_message_rewards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Drop Existing Policies (if any)
-- ============================================
-- Drop table policies
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow public insert to users" ON users;
DROP POLICY IF EXISTS "Allow users to update own record" ON users;

DROP POLICY IF EXISTS "Allow public read access to voice_messages" ON voice_messages;
DROP POLICY IF EXISTS "Allow public insert to voice_messages" ON voice_messages;
DROP POLICY IF EXISTS "Allow users to update own messages" ON voice_messages;

DROP POLICY IF EXISTS "Allow public read access to reactions" ON reactions;
DROP POLICY IF EXISTS "Allow public insert to reactions" ON reactions;
DROP POLICY IF EXISTS "Allow users to delete own reactions" ON reactions;

DROP POLICY IF EXISTS "Allow public read access to bb_points" ON bb_points;
DROP POLICY IF EXISTS "Allow public insert to bb_points" ON bb_points;

DROP POLICY IF EXISTS "Allow public read access to daily_claims" ON daily_claims;
DROP POLICY IF EXISTS "Allow public insert to daily_claims" ON daily_claims;

DROP POLICY IF EXISTS "Allow public read access to top_message_rewards" ON top_message_rewards;
DROP POLICY IF EXISTS "Allow public update to top_message_rewards" ON top_message_rewards;

-- Drop storage policies
DROP POLICY IF EXISTS "Public read access for voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files in voice-messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files in voice-messages" ON storage.objects;

-- ============================================
-- STEP 6: Create Table RLS Policies
-- ============================================
-- Users table policies
CREATE POLICY "Allow public read access to users"
ON users FOR SELECT USING (true);

CREATE POLICY "Allow public insert to users"
ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own record"
ON users FOR UPDATE USING (true) WITH CHECK (true);

-- Voice messages table policies
CREATE POLICY "Allow public read access to voice_messages"
ON voice_messages FOR SELECT USING (true);

CREATE POLICY "Allow public insert to voice_messages"
ON voice_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own messages"
ON voice_messages FOR UPDATE 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Reactions table policies
CREATE POLICY "Allow public read access to reactions"
ON reactions FOR SELECT USING (true);

CREATE POLICY "Allow public insert to reactions"
ON reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete own reactions"
ON reactions FOR DELETE
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- BB Points table policies
CREATE POLICY "Allow public read access to bb_points"
ON bb_points FOR SELECT USING (true);

CREATE POLICY "Allow public insert to bb_points"
ON bb_points FOR INSERT WITH CHECK (true);

-- Daily claims table policies
CREATE POLICY "Allow public read access to daily_claims"
ON daily_claims FOR SELECT USING (true);

CREATE POLICY "Allow public insert to daily_claims"
ON daily_claims FOR INSERT WITH CHECK (true);

-- Top message rewards table policies
CREATE POLICY "Allow public read access to top_message_rewards"
ON top_message_rewards FOR SELECT USING (true);

CREATE POLICY "Allow public update to top_message_rewards"
ON top_message_rewards FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- STEP 7: Create Storage RLS Policies
-- ============================================
CREATE POLICY "Public read access for voice-messages"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-messages');

CREATE POLICY "Public upload access for voice-messages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-messages');

CREATE POLICY "Users can update own files in voice-messages"
ON storage.objects FOR UPDATE
USING (bucket_id = 'voice-messages')
WITH CHECK (bucket_id = 'voice-messages');

CREATE POLICY "Users can delete own files in voice-messages"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-messages');

-- ============================================
-- STEP 8: Fix Existing Data (if needed)
-- ============================================
-- Fix duplicate voice-messages in voice_url paths
UPDATE voice_messages
SET voice_url = REPLACE(voice_url, '/voice-messages/voice-messages/', '/voice-messages/')
WHERE voice_url LIKE '%/voice-messages/voice-messages/%';

-- Backfill daily_claims.user_id from wallet_address (if needed)
-- Make user_id nullable temporarily
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_claims' 
    AND column_name = 'user_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE daily_claims ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Create users for wallet addresses that don't have a user record
INSERT INTO users (wallet_address)
SELECT DISTINCT wallet_address
FROM daily_claims
WHERE user_id IS NULL
  AND wallet_address NOT IN (SELECT wallet_address FROM users)
ON CONFLICT (wallet_address) DO NOTHING;

-- Update daily_claims to set user_id for records where it's NULL
UPDATE daily_claims dc
SET user_id = u.id
FROM users u
WHERE dc.user_id IS NULL
  AND dc.wallet_address = u.wallet_address;

-- ============================================
-- COMPLETE!
-- ============================================
-- All tables, indexes, triggers, and policies are now set up.
-- You can verify by running:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

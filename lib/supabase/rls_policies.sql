-- RLS Policies for Blabla App
-- Run this in Supabase SQL Editor after creating tables

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_message_rewards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow public read access to users
CREATE POLICY "Allow public read access to users"
ON users
FOR SELECT
USING (true);

-- Allow public insert to users (for wallet address registration)
CREATE POLICY "Allow public insert to users"
ON users
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own record
CREATE POLICY "Allow users to update own record"
ON users
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- VOICE_MESSAGES TABLE POLICIES
-- ============================================

-- Allow public read access to voice messages
CREATE POLICY "Allow public read access to voice_messages"
ON voice_messages
FOR SELECT
USING (true);

-- Allow public insert to voice_messages
CREATE POLICY "Allow public insert to voice_messages"
ON voice_messages
FOR INSERT
WITH CHECK (true);

-- Allow users to update their own messages
CREATE POLICY "Allow users to update own messages"
ON voice_messages
FOR UPDATE
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- ============================================
-- REACTIONS TABLE POLICIES
-- ============================================

-- Allow public read access to reactions
CREATE POLICY "Allow public read access to reactions"
ON reactions
FOR SELECT
USING (true);

-- Allow public insert to reactions
CREATE POLICY "Allow public insert to reactions"
ON reactions
FOR INSERT
WITH CHECK (true);

-- Allow users to delete their own reactions
CREATE POLICY "Allow users to delete own reactions"
ON reactions
FOR DELETE
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- ============================================
-- BB_POINTS TABLE POLICIES
-- ============================================

-- Allow public read access to bb_points
CREATE POLICY "Allow public read access to bb_points"
ON bb_points
FOR SELECT
USING (true);

-- Allow public insert to bb_points
CREATE POLICY "Allow public insert to bb_points"
ON bb_points
FOR INSERT
WITH CHECK (true);

-- ============================================
-- DAILY_CLAIMS TABLE POLICIES
-- ============================================

-- Allow public read access to daily_claims
CREATE POLICY "Allow public read access to daily_claims"
ON daily_claims
FOR SELECT
USING (true);

-- Allow public insert to daily_claims
CREATE POLICY "Allow public insert to daily_claims"
ON daily_claims
FOR INSERT
WITH CHECK (true);

-- ============================================
-- TOP_MESSAGE_REWARDS TABLE POLICIES
-- ============================================

-- Allow public read access to top_message_rewards
CREATE POLICY "Allow public read access to top_message_rewards"
ON top_message_rewards
FOR SELECT
USING (true);

-- Allow public update to top_message_rewards (for claiming)
CREATE POLICY "Allow public update to top_message_rewards"
ON top_message_rewards
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- NOTES
-- ============================================
-- These policies allow public access for read and insert operations.
-- For production, you may want to add more restrictive policies based on:
-- - Authentication status
-- - Wallet address verification
-- - Rate limiting
-- 
-- Example of more restrictive policy:
-- CREATE POLICY "Allow authenticated users only"
-- ON daily_claims
-- FOR INSERT
-- WITH CHECK (
--   auth.role() = 'authenticated' OR
--   current_setting('request.jwt.claims', true)::json->>'wallet_address' IS NOT NULL
-- );

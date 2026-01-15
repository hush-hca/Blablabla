-- Migration: Ensure daily_claims.user_id is properly set
-- Run this in Supabase SQL Editor if you have existing daily_claims records without user_id

-- Step 1: Make user_id nullable temporarily (if it's currently NOT NULL)
-- This allows us to update existing records
ALTER TABLE daily_claims 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Update existing daily_claims records to have user_id
-- This creates users for wallet addresses that don't have a user record yet
INSERT INTO users (wallet_address)
SELECT DISTINCT wallet_address
FROM daily_claims
WHERE user_id IS NULL
  AND wallet_address NOT IN (SELECT wallet_address FROM users)
ON CONFLICT (wallet_address) DO NOTHING;

-- Step 3: Update daily_claims to set user_id for records where it's NULL
UPDATE daily_claims dc
SET user_id = u.id
FROM users u
WHERE dc.user_id IS NULL
  AND dc.wallet_address = u.wallet_address;

-- Step 4: Make user_id NOT NULL again (optional, but recommended for data integrity)
-- Only run this if you're sure all records now have user_id
-- ALTER TABLE daily_claims 
-- ALTER COLUMN user_id SET NOT NULL;

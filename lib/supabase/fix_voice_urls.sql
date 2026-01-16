-- Fix duplicate voice-messages in voice_url paths
-- Run this in Supabase SQL Editor to fix existing records

-- Update voice_urls that have duplicate voice-messages/voice-messages/ in the path
UPDATE voice_messages
SET voice_url = REPLACE(voice_url, '/voice-messages/voice-messages/', '/voice-messages/')
WHERE voice_url LIKE '%/voice-messages/voice-messages/%';

-- Verify the fix
SELECT 
  id,
  voice_url,
  created_at
FROM voice_messages
WHERE voice_url LIKE '%/voice-messages/voice-messages/%'
ORDER BY created_at DESC;

-- If the above query returns no rows, the fix was successful!

-- Storage RLS Policies for voice-messages bucket
-- Run this in Supabase SQL Editor

-- Enable RLS on storage.objects (if not already enabled)
-- This is usually enabled by default, but we'll ensure it

-- ============================================
-- STORAGE POLICIES FOR voice-messages BUCKET
-- ============================================

-- Policy 1: Allow public read access (for Public bucket)
-- If your bucket is Public, this should already be set
-- But we'll create it explicitly to be sure
CREATE POLICY "Public read access for voice-messages"
ON storage.objects
FOR SELECT
USING (bucket_id = 'voice-messages');

-- Policy 2: Allow public uploads to voice-messages bucket
-- This allows anyone to upload files to the bucket
CREATE POLICY "Public upload access for voice-messages"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'voice-messages');

-- Policy 3: Allow users to update their own files (optional)
-- This allows users to update files they uploaded
CREATE POLICY "Users can update own files in voice-messages"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'voice-messages')
WITH CHECK (bucket_id = 'voice-messages');

-- Policy 4: Allow users to delete their own files (optional)
-- This allows users to delete files they uploaded
CREATE POLICY "Users can delete own files in voice-messages"
ON storage.objects
FOR DELETE
USING (bucket_id = 'voice-messages');

-- ============================================
-- NOTES
-- ============================================
-- If you get errors saying policies already exist, you can:
-- 1. Drop existing policies first:
--    DROP POLICY IF EXISTS "Public read access for voice-messages" ON storage.objects;
--    DROP POLICY IF EXISTS "Public upload access for voice-messages" ON storage.objects;
--    DROP POLICY IF EXISTS "Users can update own files in voice-messages" ON storage.objects;
--    DROP POLICY IF EXISTS "Users can delete own files in voice-messages" ON storage.objects;
--
-- 2. Or use CREATE POLICY IF NOT EXISTS (PostgreSQL 9.5+)
--
-- 3. Or check existing policies:
--    SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%voice-messages%';

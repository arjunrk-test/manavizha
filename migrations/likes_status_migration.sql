-- Migration: Add status column to likes table
-- Run this in your Supabase SQL Editor

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'status') THEN
        ALTER TABLE public.likes ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'is_read') THEN
        ALTER TABLE public.likes ADD COLUMN is_read BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing rows to 'accepted' if both sides exist (mutual interest)
UPDATE public.likes l1
SET status = 'accepted'
WHERE EXISTS (
    SELECT 1 FROM public.likes l2 
    WHERE l2.user_id = l1.liked_user_id 
    AND l2.liked_user_id = l1.user_id
);

-- Add check constraint for status values
-- ALTER TABLE public.likes ADD CONSTRAINT likes_status_check CHECK (status IN ('pending', 'accepted', 'declined'));

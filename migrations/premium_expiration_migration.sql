-- Migration: Add premium_expires_at to user_settings
-- Run this in your Supabase SQL Editor

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Note: The column premium_expires_at will store the exact timestamp when the user's premium plan expires.
-- If it is NULL, it depends on premium_plan ('till_you_marry' = infinite).

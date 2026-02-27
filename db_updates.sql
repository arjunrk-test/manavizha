-- Migration: Add Per-Partner Settings

-- 1. Add referral_percentage to existing referral_partners table
-- Since the table already exists, we use ALTER TABLE
ALTER TABLE public.referral_partners 
ADD COLUMN IF NOT EXISTS referral_percentage NUMERIC DEFAULT 10.0;

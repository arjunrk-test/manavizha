-- Migration: Add premium_plan to user_settings
-- Run this in your Supabase SQL Editor

-- 1. Add premium_plan to user_settings if it doesn't exist
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS premium_plan VARCHAR(50) DEFAULT NULL;

-- Note: The column premium_plan will store values like:
-- '3_months', 'prime_gold', 'elite', 'till_you_marry'
-- It acts as a more specific indicator alongside the existing 'is_premium' boolean.

-- Migration: Add can_edit_profile permission to referral_partners
-- Run this in your Supabase SQL editor

ALTER TABLE public.referral_partners
ADD COLUMN IF NOT EXISTS can_edit_profile BOOLEAN DEFAULT false;

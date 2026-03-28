-- Profile Data Completion Migration
-- Run this in your Supabase SQL Editor or PostgreSQL tool

-- 1. Updates to personal_details
ALTER TABLE personal_details ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'Self';
ALTER TABLE personal_details ADD COLUMN IF NOT EXISTS subcaste TEXT;
ALTER TABLE personal_details ADD COLUMN IF NOT EXISTS physical_status TEXT DEFAULT 'Normal';

-- 2. Updates to family_details
ALTER TABLE family_details ADD COLUMN IF NOT EXISTS ancestral_origin TEXT;

-- 3. Updates to partner_preferences
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS physical_status TEXT DEFAULT 'Normal';
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS citizenship TEXT DEFAULT 'Any';
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_state TEXT DEFAULT 'Any';
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_city TEXT DEFAULT 'Any';

-- Extended Profile Data Completion Migration Part 2
-- Run this in your Supabase SQL Editor or PostgreSQL tool

ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_marital_status TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_mother_tongue TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_eating_habits TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_smoking_habits TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_drinking_habits TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_religion TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_caste TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_subcaste TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_star TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_dosham TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_employment_type TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_annual_income TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_country TEXT DEFAULT 'Any';
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS preferred_physical_status TEXT DEFAULT 'Normal';
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS min_height TEXT;
ALTER TABLE partner_preferences ADD COLUMN IF NOT EXISTS max_height TEXT;

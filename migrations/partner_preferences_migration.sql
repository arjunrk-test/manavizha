-- Migration: Add new partner preference columns
-- preferred_employed_in (text[]), preferred_occupation (text[]),
-- preferred_education (text[]), preferred_annual_income_min

-- Add preferred_employed_in column (array of employment categories)
ALTER TABLE partner_preferences
  ADD COLUMN IF NOT EXISTS preferred_employed_in text[] DEFAULT '{}';

-- Add preferred_occupation as text array
ALTER TABLE partner_preferences
  ADD COLUMN IF NOT EXISTS preferred_occupation text[] DEFAULT '{}';

-- Add preferred_education as text array
ALTER TABLE partner_preferences
  ADD COLUMN IF NOT EXISTS preferred_education text[] DEFAULT '{}';

-- Add annual income min column
ALTER TABLE partner_preferences
  ADD COLUMN IF NOT EXISTS preferred_annual_income_min text;

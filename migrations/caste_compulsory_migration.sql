-- Migration: Caste compulsory flag for partner preference matching
ALTER TABLE partner_preferences
  ADD COLUMN IF NOT EXISTS caste_compulsory BOOLEAN DEFAULT FALSE;

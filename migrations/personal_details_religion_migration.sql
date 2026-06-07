-- Add religion to personal_details (collected in profile setup step 1)
ALTER TABLE public.personal_details
  ADD COLUMN IF NOT EXISTS religion VARCHAR(255);

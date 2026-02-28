-- ============================================================
-- Admin RLS Policies: Allow admins to read/update all rows
-- Run this in your Supabase SQL editor
-- ============================================================

-- Helper: a function that checks if the current user is an admin
-- (avoids repeating the subquery in every policy)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  )
$$;

-- ── personal_details ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all personal_details" ON public.personal_details;
CREATE POLICY "Admins can read all personal_details"
  ON public.personal_details FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all personal_details" ON public.personal_details;
CREATE POLICY "Admins can update all personal_details"
  ON public.personal_details FOR UPDATE
  USING (public.is_admin());

-- ── contact_details ──────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all contact_details" ON public.contact_details;
CREATE POLICY "Admins can read all contact_details"
  ON public.contact_details FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all contact_details" ON public.contact_details;
CREATE POLICY "Admins can update all contact_details"
  ON public.contact_details FOR UPDATE
  USING (public.is_admin());

-- ── education_details ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all education_details" ON public.education_details;
CREATE POLICY "Admins can read all education_details"
  ON public.education_details FOR SELECT
  USING (public.is_admin());

-- ── family_details ───────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all family_details" ON public.family_details;
CREATE POLICY "Admins can read all family_details"
  ON public.family_details FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all family_details" ON public.family_details;
CREATE POLICY "Admins can update all family_details"
  ON public.family_details FOR UPDATE
  USING (public.is_admin());

-- ── horoscope_details ────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all horoscope_details" ON public.horoscope_details;
CREATE POLICY "Admins can read all horoscope_details"
  ON public.horoscope_details FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all horoscope_details" ON public.horoscope_details;
CREATE POLICY "Admins can update all horoscope_details"
  ON public.horoscope_details FOR UPDATE
  USING (public.is_admin());

-- ── interests ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all interests" ON public.interests;
CREATE POLICY "Admins can read all interests"
  ON public.interests FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all interests" ON public.interests;
CREATE POLICY "Admins can update all interests"
  ON public.interests FOR UPDATE
  USING (public.is_admin());

-- ── social_habits ────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all social_habits" ON public.social_habits;
CREATE POLICY "Admins can read all social_habits"
  ON public.social_habits FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all social_habits" ON public.social_habits;
CREATE POLICY "Admins can update all social_habits"
  ON public.social_habits FOR UPDATE
  USING (public.is_admin());

-- ── photos ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all photos" ON public.photos;
CREATE POLICY "Admins can read all photos"
  ON public.photos FOR SELECT
  USING (public.is_admin());

-- ── referral_details ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all referral_details" ON public.referral_details;
CREATE POLICY "Admins can read all referral_details"
  ON public.referral_details FOR SELECT
  USING (public.is_admin());

-- ── profession tables ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all profession_employee" ON public.profession_employee;
CREATE POLICY "Admins can read all profession_employee"
  ON public.profession_employee FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profession_employee" ON public.profession_employee;
CREATE POLICY "Admins can update all profession_employee"
  ON public.profession_employee FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all profession_business" ON public.profession_business;
CREATE POLICY "Admins can read all profession_business"
  ON public.profession_business FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profession_business" ON public.profession_business;
CREATE POLICY "Admins can update all profession_business"
  ON public.profession_business FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all profession_student" ON public.profession_student;
CREATE POLICY "Admins can read all profession_student"
  ON public.profession_student FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profession_student" ON public.profession_student;
CREATE POLICY "Admins can update all profession_student"
  ON public.profession_student FOR UPDATE
  USING (public.is_admin());

-- ── users ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- ── referral_partners ─────────────────────────────────────────
DROP POLICY IF EXISTS "Admins can read all referral_partners" ON public.referral_partners;
CREATE POLICY "Admins can read all referral_partners"
  ON public.referral_partners FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all referral_partners" ON public.referral_partners;
CREATE POLICY "Admins can update all referral_partners"
  ON public.referral_partners FOR UPDATE
  USING (public.is_admin());

-- Drop ALL hardcoded check constraints on profile tables
-- Master data tables already enforce valid values via dropdowns

-- social_habits
ALTER TABLE public.social_habits DROP CONSTRAINT IF EXISTS social_habits_smoking_check;
ALTER TABLE public.social_habits DROP CONSTRAINT IF EXISTS social_habits_drinking_check;
ALTER TABLE public.social_habits DROP CONSTRAINT IF EXISTS social_habits_parties_check;
ALTER TABLE public.social_habits DROP CONSTRAINT IF EXISTS social_habits_pubs_check;

-- personal_details
ALTER TABLE public.personal_details DROP CONSTRAINT IF EXISTS personal_details_sex_check;
ALTER TABLE public.personal_details DROP CONSTRAINT IF EXISTS personal_details_body_type_check;
ALTER TABLE public.personal_details DROP CONSTRAINT IF EXISTS personal_details_marital_status_check;
ALTER TABLE public.personal_details DROP CONSTRAINT IF EXISTS personal_details_food_preference_check;
ALTER TABLE public.personal_details DROP CONSTRAINT IF EXISTS personal_details_complexion_check;

-- family_details
ALTER TABLE public.family_details DROP CONSTRAINT IF EXISTS family_details_family_type_check;
ALTER TABLE public.family_details DROP CONSTRAINT IF EXISTS family_details_family_status_check;

-- horoscope_details
ALTER TABLE public.horoscope_details DROP CONSTRAINT IF EXISTS horoscope_details_star_check;
ALTER TABLE public.horoscope_details DROP CONSTRAINT IF EXISTS horoscope_details_raasi_check;
ALTER TABLE public.horoscope_details DROP CONSTRAINT IF EXISTS horoscope_details_zodiac_sign_check;
ALTER TABLE public.horoscope_details DROP CONSTRAINT IF EXISTS horoscope_details_lagnam_check;
ALTER TABLE public.horoscope_details DROP CONSTRAINT IF EXISTS horoscope_details_dhosham_check;

-- contact_details
ALTER TABLE public.contact_details DROP CONSTRAINT IF EXISTS contact_details_state_check;
ALTER TABLE public.contact_details DROP CONSTRAINT IF EXISTS contact_details_country_check;

-- education_details
ALTER TABLE public.education_details DROP CONSTRAINT IF EXISTS education_details_degree_check;

-- profession tables
ALTER TABLE public.profession_employee DROP CONSTRAINT IF EXISTS profession_employee_industry_check;
ALTER TABLE public.profession_business DROP CONSTRAINT IF EXISTS profession_business_business_type_check;

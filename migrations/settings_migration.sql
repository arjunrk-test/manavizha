-- Migration: Profile Settings, Block, and Ignore Tables
-- Run this in your Supabase SQL Editor

-- 1. Create User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email_alerts JSONB DEFAULT '{"member_activity": true, "phone_views": true, "express_interest": true, "personalized_messages": true, "shortlists": true}'::jsonb,
    sms_alerts JSONB DEFAULT '{"member_activity": true, "phone_views": true, "express_interest": true, "personalized_messages": true}'::jsonb,
    call_preference TEXT DEFAULT 'Call when there are important updates',
    contact_person TEXT DEFAULT 'Self',
    convenient_call_time TEXT DEFAULT 'Anytime',
    mobile_privacy TEXT DEFAULT 'show_all', -- 'show_all', 'paid_only', 'hidden'
    horoscope_privacy TEXT DEFAULT 'visible_all', -- 'visible_all', 'contacted_only', 'password_protected'
    horoscope_password TEXT,
    profile_privacy TEXT DEFAULT 'show_all', -- 'show_all', 'registered_only'
    is_deactivated BOOLEAN DEFAULT FALSE,
    deactivated_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Row Level Security for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);


-- 2. Create Blocked Profiles Table
CREATE TABLE IF NOT EXISTS public.blocked_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, blocked_user_id)
);

-- Row Level Security for blocked_profiles
ALTER TABLE public.blocked_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocks" ON public.blocked_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blocks" ON public.blocked_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blocks" ON public.blocked_profiles
    FOR DELETE USING (auth.uid() = user_id);


-- 3. Create Ignored Profiles Table
CREATE TABLE IF NOT EXISTS public.ignored_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ignored_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, ignored_user_id)
);

-- Row Level Security for ignored_profiles
ALTER TABLE public.ignored_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ignores" ON public.ignored_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ignores" ON public.ignored_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ignores" ON public.ignored_profiles
    FOR DELETE USING (auth.uid() = user_id);

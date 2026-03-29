-- Migration: Shortlists, Likes, and Views Tables
-- Run this in your Supabase SQL Editor

-- 1. Create Shortlists Table
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    shortlisted_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, shortlisted_user_id)
);

-- Row Level Security
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shortlists" ON public.shortlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert shortlists" ON public.shortlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shortlists" ON public.shortlists
    FOR DELETE USING (auth.uid() = user_id);


-- 2. Create Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    liked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, liked_user_id)
);

-- Row Level Security
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own likes" ON public.likes
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = liked_user_id);

CREATE POLICY "Users can insert likes" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);


-- 3. Create Profile Views Table
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile_views" ON public.profile_views
    FOR SELECT USING (auth.uid() = viewer_user_id OR auth.uid() = viewed_user_id);

CREATE POLICY "Users can insert profile_views" ON public.profile_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_user_id);

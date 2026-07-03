-- =============================================================
-- Manavizha feature batch migration — run in Supabase SQL editor
-- Adds: interest acceptance date, notifications, reports,
-- profile codes, ID verification, contact-view tier limits,
-- photo privacy + requests, E2E message keys.
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT guards).
-- =============================================================

-- 1. Acceptance date on interests -----------------------------
ALTER TABLE likes ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

-- 2. In-app notifications -------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,                    -- recipient
    actor_id uuid,                            -- who triggered it
    type text NOT NULL,                       -- interest_received / interest_accepted / message_received / photo_request / photo_request_approved
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at DESC);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Reports / moderation queue -------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL,
    reported_user_id uuid NOT NULL,
    reason text NOT NULL,                     -- fake_profile / harassment / inappropriate_content / scam / married / other
    details text,
    status text NOT NULL DEFAULT 'pending',   -- pending / reviewed / action_taken / dismissed
    admin_note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status, created_at DESC);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. Human-friendly profile codes (MNV#####) ------------------
CREATE SEQUENCE IF NOT EXISTS profile_code_seq START 10001;
ALTER TABLE personal_details ADD COLUMN IF NOT EXISTS profile_code text UNIQUE;

UPDATE personal_details
SET profile_code = 'MNV' || lpad(nextval('profile_code_seq')::text, 5, '0')
WHERE profile_code IS NULL;

CREATE OR REPLACE FUNCTION set_profile_code() RETURNS trigger AS $$
BEGIN
    IF NEW.profile_code IS NULL THEN
        NEW.profile_code := 'MNV' || lpad(nextval('profile_code_seq')::text, 5, '0');
    END IF;
    RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profile_code ON personal_details;
CREATE TRIGGER trg_profile_code BEFORE INSERT ON personal_details
FOR EACH ROW EXECUTE FUNCTION set_profile_code();

-- 5. ID / document verification -------------------------------
CREATE TABLE IF NOT EXISTS id_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    document_type text NOT NULL,              -- aadhaar / pan / passport / driving_license / voter_id
    document_url text NOT NULL,
    status text NOT NULL DEFAULT 'pending',   -- pending / approved / rejected
    admin_note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    reviewed_at timestamptz
);
ALTER TABLE id_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_details ADD COLUMN IF NOT EXISTS id_verified boolean NOT NULL DEFAULT false;

-- Private storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own ID docs" ON storage.objects;
CREATE POLICY "Users upload own ID docs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users read own ID docs" ON storage.objects;
CREATE POLICY "Users read own ID docs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 6. Contact-view tier limits ---------------------------------
CREATE TABLE IF NOT EXISTS tier_limits (
    tier text PRIMARY KEY,                    -- free / premium / prime_gold
    contact_view_limit integer NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO tier_limits (tier, contact_view_limit) VALUES
    ('free', 0), ('premium', 25), ('prime_gold', 100)
ON CONFLICT (tier) DO NOTHING;
ALTER TABLE tier_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS contact_view_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id uuid NOT NULL,
    viewed_user_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (viewer_id, viewed_user_id)        -- re-viewing the same contact is free
);
ALTER TABLE contact_view_log ENABLE ROW LEVEL SECURITY;

-- 7. Photo privacy + photo requests ---------------------------
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS photo_visibility text NOT NULL DEFAULT 'everyone'; -- everyone / on_accept

CREATE TABLE IF NOT EXISTS photo_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending',   -- pending / approved / declined
    created_at timestamptz NOT NULL DEFAULT now(),
    responded_at timestamptz,
    UNIQUE (requester_id, owner_id)
);
ALTER TABLE photo_requests ENABLE ROW LEVEL SECURITY;

-- 8. E2E message encryption -----------------------------------
CREATE TABLE IF NOT EXISTS user_keys (
    user_id uuid PRIMARY KEY,
    public_key jsonb NOT NULL,                -- ECDH P-256 public key as JWK
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted boolean NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS iv text;    -- base64 AES-GCM IV

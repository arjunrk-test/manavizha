-- Photo-password privacy mode.
-- photo_visibility already exists ('everyone' | 'on_accept'); this adds the
-- 'password' option's stored secret. Run in the Supabase SQL editor.

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS photo_password text;

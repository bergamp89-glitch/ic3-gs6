-- ============================================================
-- IC3-GS6 Quiz App — Supabase Jadvallar (To'liq)
-- Supabase SQL Editor ga shu kodni nusxalab ishga tushiring.
-- ============================================================

-- ========================
-- 1. settings jadvali
-- ========================
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- Boshlang'ich ma'lumotlarni qo'shish
INSERT INTO settings (key, value) VALUES 
('levels_status', '{"1-Level": true, "2-Level": true, "3-Level": true}'),
('admin_creds', '{"firstName": "admin", "lastName": "Doe", "email": "0807"}')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_anon_read" ON settings;
CREATE POLICY "settings_anon_read" ON settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_anon_write" ON settings;
CREATE POLICY "settings_anon_write" ON settings
  FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- 2. exam_sessions jadvali
-- ========================
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  questions jsonb,
  current_index integer DEFAULT 0,
  app_state text,
  registration jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_sessions_anon_read" ON exam_sessions;
CREATE POLICY "exam_sessions_anon_read" ON exam_sessions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "exam_sessions_anon_write" ON exam_sessions;
CREATE POLICY "exam_sessions_anon_write" ON exam_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- 3. requests jadvali (Foydalanuvchi so'rovlari)
-- ========================
CREATE TABLE IF NOT EXISTS requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "firstName" text,
  "lastName" text,
  birth_date text,
  email text,
  level text,
  photo text,
  descriptor jsonb,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE requests ADD COLUMN IF NOT EXISTS photo text;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS descriptor jsonb;


ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_anon_read" ON requests;
CREATE POLICY "requests_anon_read" ON requests
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "requests_anon_write" ON requests;
CREATE POLICY "requests_anon_write" ON requests
  FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- 4. questions jadvali (Savollar bazasi)
-- ========================
CREATE TABLE IF NOT EXISTS questions (
  id integer PRIMARY KEY,
  level_num integer NOT NULL,
  type text,
  prompt text,
  data jsonb
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_anon_read" ON questions;
CREATE POLICY "questions_anon_read" ON questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "questions_anon_write" ON questions;
CREATE POLICY "questions_anon_write" ON questions
  FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- 5. leaderboard jadvali (Natijalar jadvali)
-- ========================
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text,
  level_num integer,
  score integer,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leaderboard_anon_read" ON leaderboard;
CREATE POLICY "leaderboard_anon_read" ON leaderboard
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "leaderboard_anon_write" ON leaderboard;
CREATE POLICY "leaderboard_anon_write" ON leaderboard
  FOR ALL USING (true) WITH CHECK (true);


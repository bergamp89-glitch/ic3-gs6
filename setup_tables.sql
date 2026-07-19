-- Supabase SQL Editor ga shu kodni nusxalab ishga tushiring:

-- 1. settings jadvali
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- Boshlang'ich ma'lumotlarni qo'shish
INSERT INTO settings (key, value) VALUES 
('levels_status', '{"1-Level": true, "2-Level": true, "3-Level": true}'),
('admin_creds', '{"firstName": "admin", "lastName": "Doe", "email": "0807"}')
ON CONFLICT (key) DO NOTHING;

-- Barcha foydalanuvchilar o'qishi/yozishi uchun ruxsat (RLS o'chirilgan holati uchun, yoki quyidagi policy larni qo'shing)
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- 2. exam_sessions jadvali (Test jarayonini saqlash uchun)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  questions jsonb,
  current_index integer DEFAULT 0,
  app_state text,
  registration jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE exam_sessions DISABLE ROW LEVEL SECURITY;

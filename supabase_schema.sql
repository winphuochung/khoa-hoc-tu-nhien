-- ========================================================
-- SCHEMA DỮ LIỆU WEBSITE KHOA HỌC TỰ NHIÊN TRÊN SUPABASE
-- Dự án: https://cclporgmzhtaskzuydzv.supabase.co
-- Hướng dẫn: Mở Supabase Dashboard -> SQL Editor -> Dán và bấm Run
-- ========================================================

-- 1. BẢNG CẤU HÌNH NHÀ TRƯỜNG & HỆ THỐNG
CREATE TABLE IF NOT EXISTS public.school_config (
    id TEXT PRIMARY KEY DEFAULT 'config-default',
    school_name TEXT NOT NULL DEFAULT 'Trường TH – THCS Phước Hưng',
    teacher_name TEXT NOT NULL DEFAULT 'Lê Văn Thắng',
    school_year TEXT NOT NULL DEFAULT '2026 – 2027',
    classes JSONB NOT NULL DEFAULT '["9A1", "9A2", "9A3"]'::jsonb,
    anti_cheat_max_violations INT NOT NULL DEFAULT 3,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG NGƯỜI DÙNG (GIÁO VIÊN & HỌC SINH TỪNG LỚP)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    class_name TEXT DEFAULT '9A1',
    initial_password TEXT,
    password_hash TEXT NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_class ON public.users (class_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- 3. BẢNG ĐỀ KIỂM TRA PHÁT HÀNH
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY,
    grade INT NOT NULL DEFAULT 9,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'midterm',
    school_year TEXT DEFAULT '2026 – 2027',
    duration_minutes INT NOT NULL DEFAULT 90,
    total_points NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    assigned_classes JSONB NOT NULL DEFAULT '["9A1", "9A2", "9A3"]'::jsonb,
    lesson_scope JSONB NOT NULL DEFAULT '[]'::jsonb,
    question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    paper_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    matrix_rows JSONB DEFAULT '[]'::jsonb,
    specification_rows JSONB DEFAULT '[]'::jsonb,
    allow_review BOOLEAN DEFAULT FALSE,
    is_open BOOLEAN DEFAULT TRUE,
    max_tab_violations INT DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_grade ON public.exams (grade);
CREATE INDEX IF NOT EXISTS idx_exams_is_open ON public.exams (is_open);

-- 4. BẢNG BÀI LÀM CỦA HỌC SINH
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_username TEXT NOT NULL,
    class_name TEXT NOT NULL,
    paper_code TEXT NOT NULL,
    paper_signature TEXT NOT NULL,
    paper_snapshot JSONB NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    finalized_at TIMESTAMPTZ,
    auto_graded_score NUMERIC(4, 2) DEFAULT 0,
    manual_graded_score NUMERIC(4, 2) DEFAULT 0,
    total_score NUMERIC(4, 2) DEFAULT 0,
    violation_count INT DEFAULT 0,
    flagged_for_review BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    teacher_overall_feedback TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    activity_logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_exam ON public.submissions (exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_class ON public.submissions (class_name);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions (status);

-- 5. BẢNG TIẾN ĐỘ HỌC TẬP TỪNG BÀI
CREATE TABLE IF NOT EXISTS public.student_progress (
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id INT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    practice_score NUMERIC(4, 2),
    notes TEXT,
    PRIMARY KEY (user_id, lesson_id)
);

-- KÍCH HOẠT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.school_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- POLICIES: Cho phép service_role và anon đọc/ghi theo API của ứng dụng
CREATE POLICY "Public read config" ON public.school_config FOR SELECT USING (true);
CREATE POLICY "Service role all config" ON public.school_config FOR ALL USING (true);

CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Service role all users" ON public.users FOR ALL USING (true);

CREATE POLICY "Public read exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Service role all exams" ON public.exams FOR ALL USING (true);

CREATE POLICY "Public read submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Service role all submissions" ON public.submissions FOR ALL USING (true);

CREATE POLICY "Public read progress" ON public.student_progress FOR SELECT USING (true);
CREATE POLICY "Service role all progress" ON public.student_progress FOR ALL USING (true);

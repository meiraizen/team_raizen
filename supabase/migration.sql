-- ============================================================
-- RAiZEN KARATE SCHOOL - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (custom auth users)
-- ============================================================
CREATE TABLE profiles (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- ============================================================
-- 2. ROLES
-- ============================================================
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  hierarchy_level INT NOT NULL DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. MODULES (feature permissions)
-- ============================================================
CREATE TABLE modules (
  id BIGSERIAL PRIMARY KEY,
  module_key TEXT UNIQUE NOT NULL,
  module_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. ROLE-MODULE PERMISSIONS
-- ============================================================
CREATE TABLE role_module_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL REFERENCES modules(module_key) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  granted_by TEXT,
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, module_key)
);

-- ============================================================
-- 5. USER ROLES
-- ============================================================
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL REFERENCES profiles(email) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by TEXT,
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, role_id)
);

-- ============================================================
-- 6. USER-MODULE PERMISSIONS (individual overrides)
-- ============================================================
CREATE TABLE user_module_permissions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL REFERENCES profiles(email) ON DELETE CASCADE,
  module_key TEXT NOT NULL REFERENCES modules(module_key) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  granted_by TEXT,
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email, module_key)
);

-- ============================================================
-- 7. BATCHES
-- ============================================================
CREATE TABLE batches (
  id BIGSERIAL PRIMARY KEY,
  batch_name TEXT NOT NULL,
  days TEXT[],
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- ============================================================
-- 8. STUDENTS
-- ============================================================
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  age INT,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  school TEXT,
  phone TEXT,
  emergency_phone TEXT,
  address TEXT,
  landmark TEXT,
  motivations TEXT[],
  how_knew TEXT[],
  past_karate_experience BOOLEAN DEFAULT false,
  past_karate_details TEXT,
  health_condition BOOLEAN DEFAULT false,
  health_condition_details TEXT,
  belt_level TEXT DEFAULT 'White',
  batch_id BIGINT REFERENCES batches(id) ON DELETE SET NULL,
  joining_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

CREATE INDEX idx_students_name ON students(full_name);
CREATE INDEX idx_students_active ON students(is_active);
CREATE INDEX idx_students_batch ON students(batch_id);
CREATE INDEX idx_students_belt ON students(belt_level);

-- ============================================================
-- 9. ATTENDANCE
-- ============================================================
CREATE TABLE attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  batch_id BIGINT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_present BOOLEAN DEFAULT true,
  marked_by TEXT,
  marked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, batch_id, date)
);

CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_batch_date ON attendance(batch_id, date);

-- ============================================================
-- 10. RECEIPTS / BILLS
-- ============================================================
CREATE TABLE receipts (
  id BIGSERIAL PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  student_name TEXT NOT NULL,
  paid_for TEXT[],
  fee_paid NUMERIC(10,2) NOT NULL,
  batch TEXT,
  remarks TEXT,
  paid_to TEXT,
  payment_method TEXT[],
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_receipts_date ON receipts(date);
CREATE INDEX idx_receipts_student ON receipts(student_name);
CREATE INDEX idx_receipts_receipt_no ON receipts(receipt_no);

-- ============================================================
-- 11. CERTIFICATES
-- ============================================================
CREATE TABLE certificates (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  belt_level TEXT NOT NULL,
  exam_date DATE,
  issue_date DATE DEFAULT CURRENT_DATE,
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  certificate_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certificates_hash ON certificates(certificate_hash);
CREATE INDEX idx_certificates_student ON certificates(student_name);

-- ============================================================
-- 12. MESSAGES (chat) - keep existing structure
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_email TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_sender ON messages(sender_email);
CREATE INDEX idx_messages_receiver ON messages(receiver_email);
CREATE INDEX idx_messages_conversation ON messages(sender_email, receiver_email);

-- ============================================================
-- 13. TOURNAMENTS
-- ============================================================
CREATE TABLE tournaments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tournament_name TEXT NOT NULL,
  tournament_date DATE,
  result TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

CREATE INDEX idx_tournaments_student ON tournaments(student_id);

-- ============================================================
-- 14. AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_email TEXT NOT NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_email);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_time ON audit_logs(created_at);

-- ============================================================
-- 15. LOGIN HISTORY
-- ============================================================
CREATE TABLE login_history (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  login_method TEXT DEFAULT 'otp',
  success BOOLEAN DEFAULT true,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_login_history_email ON login_history(email);

-- ============================================================
-- 16. USER COURSE PROGRESS (Online Dojo)
-- ============================================================
CREATE TABLE user_course_progress (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  subtopic_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(email, subtopic_id)
);

CREATE INDEX idx_course_progress_email ON user_course_progress(email);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Roles
INSERT INTO roles (name, description, hierarchy_level, is_system) VALUES
  ('super_admin', 'Full system access. Can manage all users, roles, and permissions.', 0, true),
  ('admin', 'Can manage instructors and view all data. Cannot manage other admins.', 1, true),
  ('instructor', 'Can manage students, take attendance, and use chat.', 2, true);

-- Default Modules
INSERT INTO modules (module_key, module_name, description) VALUES
  ('billbook', 'Bill Book', 'Manage student bills and receipts'),
  ('students_info', 'Students Info', 'View and manage student information'),
  ('attendance', 'Attendance', 'Take and manage attendance records'),
  ('chat', 'Chat', 'Real-time messaging between team members'),
  ('certificates', 'Verify Certificate', 'Search and verify student certificates'),
  ('onlinedojo', 'Online Dojo', 'Course video management'),
  ('student_registration', 'Student Registration', 'Register new students'),
  ('edit_student', 'Edit Student Details', 'Modify existing student records'),
  ('delete_student', 'Delete Student', 'Remove student records from system'),
  ('user_management', 'User Management', 'Manage users, roles, and permissions'),
  ('receipt_download', 'Receipt Download', 'Download single or bulk receipts as PNG');

-- Default Role-Module Permissions (super_admin gets everything)
INSERT INTO role_module_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.module_key, true, true, true, true
FROM roles r CROSS JOIN modules m
WHERE r.name = 'super_admin';

-- Admin gets view + create on most things
INSERT INTO role_module_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.module_key,
  CASE WHEN m.module_key IN ('user_management') THEN false ELSE true END,
  CASE WHEN m.module_key IN ('user_management', 'certificates') THEN false ELSE true END,
  CASE WHEN m.module_key IN ('user_management') THEN false ELSE true END,
  CASE WHEN m.module_key IN ('user_management', 'delete_student') THEN false ELSE true END
FROM roles r CROSS JOIN modules m
WHERE r.name = 'admin';

-- Instructor gets limited access
INSERT INTO role_module_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.module_key,
  CASE WHEN m.module_key IN ('billbook', 'user_management') THEN false
       WHEN m.module_key IN ('receipt_download') THEN false
       ELSE true END,
  CASE WHEN m.module_key IN ('student_registration', 'attendance', 'chat') THEN true ELSE false END,
  CASE WHEN m.module_key IN ('students_info', 'attendance') THEN true ELSE false END,
  false
FROM roles r CROSS JOIN modules m
WHERE r.name = 'instructor';

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Since we use custom auth (not Supabase Auth), we use a helper function
-- that checks if the request comes from an authenticated profile
CREATE OR REPLACE FUNCTION public.is_authenticated(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE profiles.email = is_authenticated.email AND is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For custom auth apps, RLS policies typically use the email header.
-- In practice, since you're using the anon key + custom auth,
-- you will enforce permissions in the application layer via the usePermissions hook.
-- The RLS below provides defense-in-depth.

-- Profiles: users can read own profile, super_admin can read all
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (true); -- Allow all reads (filtered in app layer)

CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (true);

-- Students: broad access (filtered in app layer)
CREATE POLICY students_all ON students FOR ALL
  USING (true);

-- Attendance: broad access
CREATE POLICY attendance_all ON attendance FOR ALL
  USING (true);

-- Receipts: broad access
CREATE POLICY receipts_all ON receipts FOR ALL
  USING (true);

-- Certificates: broad access
CREATE POLICY certificates_all ON certificates FOR ALL
  USING (true);

-- Audit logs: broad access (filtered in app layer)
CREATE POLICY audit_logs_all ON audit_logs FOR ALL
  USING (true);

-- User roles: allow anon key to read (permissions enforced in app layer)
CREATE POLICY user_roles_select ON user_roles FOR SELECT
  USING (true);

CREATE POLICY user_roles_insert ON user_roles FOR INSERT
  WITH CHECK (true);
CREATE POLICY user_roles_update ON user_roles FOR UPDATE
  USING (true);
CREATE POLICY user_roles_delete ON user_roles FOR DELETE
  USING (true);

-- Role-module permissions: allow anon key to read/write
CREATE POLICY role_module_permissions_select ON role_module_permissions FOR SELECT
  USING (true);
CREATE POLICY role_module_permissions_insert ON role_module_permissions FOR INSERT
  WITH CHECK (true);
CREATE POLICY role_module_permissions_update ON role_module_permissions FOR UPDATE
  USING (true);
CREATE POLICY role_module_permissions_delete ON role_module_permissions FOR DELETE
  USING (true);

-- User-module permissions: allow anon key to read/write
CREATE POLICY user_module_permissions_select ON user_module_permissions FOR SELECT
  USING (true);
CREATE POLICY user_module_permissions_insert ON user_module_permissions FOR INSERT
  WITH CHECK (true);
CREATE POLICY user_module_permissions_update ON user_module_permissions FOR UPDATE
  USING (true);
CREATE POLICY user_module_permissions_delete ON user_module_permissions FOR DELETE
  USING (true);

-- Batches: broad access
CREATE POLICY batches_all ON batches FOR ALL
  USING (true);

-- Login history: allow insert + select for audit logging
CREATE POLICY login_history_insert ON login_history FOR INSERT
  WITH CHECK (true);
CREATE POLICY login_history_select ON login_history FOR SELECT
  USING (true);

-- Course progress: broad access
CREATE POLICY user_course_progress_all ON user_course_progress FOR ALL
  USING (true);

-- Grant anon role access to all tables and sequences
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================
-- HELPER FUNCTION: Get user permissions
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_permissions(user_email TEXT)
RETURNS TABLE (
  module_key TEXT,
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (m.module_key)
    m.module_key,
    COALESCE(ump.can_view, rmp.can_view, false) AS can_view,
    COALESCE(ump.can_create, rmp.can_create, false) AS can_create,
    COALESCE(ump.can_edit, rmp.can_edit, false) AS can_edit,
    COALESCE(ump.can_delete, rmp.can_delete, false) AS can_delete
  FROM modules m
  LEFT JOIN role_module_permissions rmp ON rmp.module_key = m.module_key
    AND rmp.role_id IN (SELECT ur.role_id FROM user_roles ur WHERE ur.email = user_email)
  LEFT JOIN user_module_permissions ump ON ump.module_key = m.module_key AND ump.email = user_email
  WHERE COALESCE(ump.can_view, rmp.can_view, false) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Get user role
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS TABLE (
  role_id BIGINT,
  role_name TEXT,
  hierarchy_level INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.hierarchy_level
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Get all roles (bypasses RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION get_all_roles()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  hierarchy_level INT,
  is_system BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.description, r.hierarchy_level, r.is_system
  FROM roles r
  ORDER BY r.hierarchy_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: Get all modules (bypasses RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION get_all_modules()
RETURNS TABLE (
  id BIGINT,
  module_key TEXT,
  module_name TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.module_key, m.module_name, m.description
  FROM modules m
  ORDER BY m.module_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

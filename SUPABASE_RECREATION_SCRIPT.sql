-- ============================================================================
-- SUPABASE DATABASE RECREATION SCRIPT
-- Project: Quantiverse MockInterview
-- Date: December 13, 2024
-- Status: Ready to Execute
-- ============================================================================

-- NOTE: Run this entire script in Supabase SQL Editor
-- It will recreate all 9 tables with proper schemas and indexes

-- ============================================================================
-- STEP 1: CREATE TABLES
-- ============================================================================

-- 1.1 Create companies table (reference data)
CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.2 Create role_levels table (reference data)
CREATE TABLE IF NOT EXISTS role_levels (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.3 Create user_roles table (user role assignments)
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.4 Create interview table (mock interview records)
CREATE TABLE IF NOT EXISTS interview (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview TEXT,
  position TEXT,
  status TEXT,
  appointment TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1.5 Create job_readiness_assessments table
CREATE TABLE IF NOT EXISTS job_readiness_assessments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  role_level_id BIGINT REFERENCES role_levels(id) ON DELETE SET NULL,
  company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  job_description TEXT NOT NULL,
  company_details TEXT NOT NULL,
  resume_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.6 Create simulations table (internship projects)
CREATE TABLE IF NOT EXISTS simulations (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration TEXT NOT NULL,
  image TEXT,
  overview TEXT NOT NULL,
  features TEXT NOT NULL,
  skills TEXT NOT NULL,
  rating FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.7 Create tasks table (tasks within simulations)
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  simulation_id BIGINT NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  full_title TEXT NOT NULL,
  duration TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  description TEXT NOT NULL,
  what_youll_learn TEXT NOT NULL,
  what_youll_do TEXT NOT NULL,
  material_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1.8 Create user_task_progress table (critical for internship module)
CREATE TABLE IF NOT EXISTS user_task_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id BIGINT NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  confirmation_status TEXT,
  uploaded_work_url TEXT,
  comment TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- 1.9 Create questions table (question bank)
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  company TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- 2.1 Indexes for interview table
CREATE INDEX IF NOT EXISTS idx_interview_user_id ON interview(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_status ON interview(status);

-- 2.2 Indexes for job_readiness_assessments table
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON job_readiness_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON job_readiness_assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_role_level_id ON job_readiness_assessments(role_level_id);

-- 2.3 Indexes for simulations table
CREATE INDEX IF NOT EXISTS idx_simulations_category ON simulations(category);
CREATE INDEX IF NOT EXISTS idx_simulations_difficulty ON simulations(difficulty);

-- 2.4 Indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_simulation_id ON tasks(simulation_id);

-- 2.5 Indexes for user_task_progress table (most critical)
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_simulation_id ON user_task_progress(simulation_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON user_task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_confirmation_status ON user_task_progress(confirmation_status);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_task_progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_user_simulation ON user_task_progress(user_id, simulation_id);

-- 2.6 Indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- 2.7 Indexes for questions table
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_company ON questions(company);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- 2.8 Unique indexes for reference tables
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_role_levels_name ON role_levels(name);

-- ============================================================================
-- STEP 3: SEED REFERENCE DATA
-- ============================================================================

-- 3.1 Insert role levels
INSERT INTO role_levels (name) VALUES 
  ('Intern'),
  ('Junior'),
  ('Mid-Level'),
  ('Senior'),
  ('Lead'),
  ('Manager')
ON CONFLICT (name) DO NOTHING;

-- 3.2 Insert sample companies
INSERT INTO companies (name) VALUES 
  ('Google'),
  ('Amazon'),
  ('Microsoft'),
  ('Meta'),
  ('Apple'),
  ('Tesla'),
  ('Netflix'),
  ('Uber'),
  ('Airbnb'),
  ('Twitter'),
  ('LinkedIn'),
  ('Stripe'),
  ('Figma')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user-specific tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_progress ENABLE ROW LEVEL SECURITY;

-- Enable RLS on public tables
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================================================

-- 5.1 user_roles policies
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 5.2 interview policies
DROP POLICY IF EXISTS "Users can view their own interviews" ON interview;
CREATE POLICY "Users can view their own interviews" ON interview
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert interviews" ON interview;
CREATE POLICY "Users can insert interviews" ON interview
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5.3 job_readiness_assessments policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON job_readiness_assessments;
CREATE POLICY "Users can view their own assessments" ON job_readiness_assessments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert assessments" ON job_readiness_assessments;
CREATE POLICY "Users can insert assessments" ON job_readiness_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5.4 user_task_progress policies
DROP POLICY IF EXISTS "Users can view their own progress" ON user_task_progress;
CREATE POLICY "Users can view their own progress" ON user_task_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON user_task_progress;
CREATE POLICY "Users can insert their own progress" ON user_task_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON user_task_progress;
CREATE POLICY "Users can update their own progress" ON user_task_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 5.5 Public read policies for reference tables
DROP POLICY IF EXISTS "Anyone can view simulations" ON simulations;
CREATE POLICY "Anyone can view simulations" ON simulations 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view tasks" ON tasks;
CREATE POLICY "Anyone can view tasks" ON tasks 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
CREATE POLICY "Anyone can view companies" ON companies 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view role_levels" ON role_levels;
CREATE POLICY "Anyone can view role_levels" ON role_levels 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
CREATE POLICY "Anyone can view questions" ON questions 
  FOR SELECT USING (true);

-- ============================================================================
-- STEP 6: VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the tables were created:
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';

-- Count records in each table:
-- SELECT 'user_roles' as table_name, COUNT(*) as count FROM user_roles UNION ALL
-- SELECT 'interview', COUNT(*) FROM interview UNION ALL
-- SELECT 'job_readiness_assessments', COUNT(*) FROM job_readiness_assessments UNION ALL
-- SELECT 'simulations', COUNT(*) FROM simulations UNION ALL
-- SELECT 'tasks', COUNT(*) FROM tasks UNION ALL
-- SELECT 'user_task_progress', COUNT(*) FROM user_task_progress UNION ALL
-- SELECT 'questions', COUNT(*) FROM questions UNION ALL
-- SELECT 'companies', COUNT(*) FROM companies UNION ALL
-- SELECT 'role_levels', COUNT(*) FROM role_levels
-- ORDER BY table_name;

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================

/*
AFTER RUNNING THIS SCRIPT, YOU MUST:

1. Create Storage Buckets Manually:
   - Go to Supabase Dashboard → Storage
   - Create 3 NEW BUCKETS (mark as PUBLIC):
     * resumes
     * submissions
     * task-materials

2. For Admin Operations (if needed):
   - Add admin-specific RLS policies in a separate script
   - Use Firebase/JWT tokens for admin verification

3. Test the database:
   - Run verification queries above
   - Check that role_levels has 6 records
   - Check that companies has 13 records

4. Grant Service Role Access (if needed):
   - For backend operations, grant service_role permissions
   - This is needed for automated tasks

RELATIONSHIPS:
- user_roles.user_id → auth.users.id
- interview.user_id → auth.users.id
- job_readiness_assessments.user_id → auth.users.id
- job_readiness_assessments.role_level_id → role_levels.id
- job_readiness_assessments.company_id → companies.id
- user_task_progress.user_id → auth.users.id
- user_task_progress.simulation_id → simulations.id
- user_task_progress.task_id → tasks.id
- tasks.simulation_id → simulations.id

CASCADE DELETES:
- Deleting a user deletes all related records (interviews, assessments, progress)
- Deleting a simulation deletes all related tasks and progress
- Deleting a task deletes all related progress records

UNIQUE CONSTRAINTS:
- user_task_progress(user_id, task_id) - One progress record per user per task
- companies(name) - One company per unique name
- role_levels(name) - One role level per unique name
*/

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

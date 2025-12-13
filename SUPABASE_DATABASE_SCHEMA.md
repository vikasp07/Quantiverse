# Supabase Database Schema - Complete Documentation

## Project: Quantiverse MockInterview

---

## TABLE OF CONTENTS
1. [Database Tables Overview](#overview)
2. [Detailed Table Schemas](#schemas)
3. [Storage Buckets](#storage)
4. [Relationships](#relationships)
5. [Recreation Instructions](#recreation)

---

## OVERVIEW

The Supabase database contains **9 main tables** and **3 storage buckets**:

### Main Tables:
1. `interview` - Mock interview records
2. `job_readiness_assessments` - Job readiness assessment records
3. `simulations` - Internship simulation projects
4. `tasks` - Tasks within simulations
5. `user_task_progress` - User progress tracking for tasks
6. `user_roles` - User role assignments
7. `questions` - Interview question bank
8. `companies` - Company reference data
9. `role_levels` - Job role level reference data

### Storage Buckets:
1. `resumes` - User resume files
2. `submissions` - Task submission files
3. `task-materials` - Task material/instruction files

---

## SCHEMAS

### 1. TABLE: `interview`

**Purpose:** Stores mock interview session records

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique interview record ID |
| `user_id` | uuid | FOREIGN KEY (auth.users) | User who conducted the interview |
| `interview` | text | NULL allowed | Type of interview (e.g., "Mock Interview", "Job Readiness Assessment") |
| `position` | text | NULL allowed | Job position being interviewed for |
| `status` | text | NULL allowed | Interview status (e.g., "Completed", "Pending") |
| `appointment` | text | NULL allowed | Appointment date/time (ISO format or "N/A") |
| `resume_url` | text | NULL allowed | URL to resume used in interview |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "interview": "Mock Interview",
  "position": "Senior React Developer",
  "status": "Completed",
  "appointment": "N/A",
  "resume_url": "https://storage-url/resumes/550e8400.../resume.pdf",
  "created_at": "2024-12-13T10:30:00Z"
}
```

**Indexes Needed:**
- `user_id` (for fast filtering by user)
- `status` (for filtering by status)

---

### 2. TABLE: `job_readiness_assessments`

**Purpose:** Stores job readiness assessment records with job and company details

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique assessment ID |
| `user_id` | uuid | FOREIGN KEY (auth.users) | User conducting assessment |
| `position` | text | NOT NULL | Target job position |
| `role_level_id` | bigint | FOREIGN KEY (role_levels) | Role level ID |
| `company_id` | bigint | FOREIGN KEY (companies) | Company ID |
| `job_description` | text | NOT NULL | Full job description text |
| `company_details` | text | NOT NULL | Company information/details |
| `resume_url` | text | NOT NULL | Path to uploaded resume |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamp | DEFAULT NOW() | Last update timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "position": "Senior Data Analyst",
  "role_level_id": 3,
  "company_id": 2,
  "job_description": "We are looking for a data analyst with 5+ years of experience...",
  "company_details": "Tech-focused company, founded in 2015, 500+ employees",
  "resume_url": "550e8400.../1702467000000_resume.pdf",
  "created_at": "2024-12-13T09:00:00Z",
  "updated_at": "2024-12-13T09:00:00Z"
}
```

**Indexes Needed:**
- `user_id` (for filtering by user)
- `company_id` (for joining with companies)
- `role_level_id` (for joining with role_levels)

---

### 3. TABLE: `simulations`

**Purpose:** Stores internship simulation/project records

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique simulation ID |
| `title` | text | NOT NULL | Simulation/project title |
| `description` | text | NOT NULL | Detailed description |
| `category` | text | NOT NULL | Project category (e.g., "Software Development", "Design") |
| `difficulty` | text | NOT NULL | Difficulty level (Beginner, Intermediate, Advanced) |
| `duration` | text | NOT NULL | Expected duration (e.g., "1-2 weeks", "1-2 months") |
| `image` | text | NULL allowed | URL to project image/thumbnail |
| `overview` | text | NOT NULL | Brief overview/summary |
| `features` | text | NOT NULL | Key features/deliverables |
| `skills` | text | NOT NULL | Skills required or learned |
| `rating` | float | NULL allowed (default NULL) | Average rating |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamp | DEFAULT NOW() | Last update timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "title": "E-Commerce Platform Development",
  "description": "Build a full-stack e-commerce platform with payment integration",
  "category": "Software Development",
  "difficulty": "Advanced",
  "duration": "1-2 months",
  "image": "https://storage-url/images/ecommerce.jpg",
  "overview": "Create a complete e-commerce solution with frontend and backend",
  "features": "Product Management, Cart System, Payment Gateway, User Authentication",
  "skills": "React, Node.js, MongoDB, Stripe API",
  "rating": null,
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

**Indexes Needed:**
- `category` (for filtering by category)
- `difficulty` (for filtering by difficulty)

---

### 4. TABLE: `tasks`

**Purpose:** Stores individual tasks within simulations

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique task ID |
| `simulation_id` | bigint | FOREIGN KEY (simulations) | Parent simulation ID |
| `title` | text | NOT NULL | Task number/title (e.g., "Task One") |
| `full_title` | text | NOT NULL | Full descriptive task title |
| `duration` | text | NOT NULL | Task duration (e.g., "30-60 mins") |
| `difficulty` | text | NOT NULL | Task difficulty level |
| `description` | text | NOT NULL | Detailed task description |
| `what_youll_learn` | text | NOT NULL | Learning outcomes |
| `what_youll_do` | text | NOT NULL | What user will do in task |
| `material_url` | text | NULL allowed | URL to task materials/resources |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | timestamp | DEFAULT NOW() | Last update timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "simulation_id": 1,
  "title": "Task One",
  "full_title": "Setup Project Structure And Environment",
  "duration": "30-60 mins",
  "difficulty": "Beginner",
  "description": "Initialize the project repository and set up the development environment...",
  "what_youll_learn": "Project initialization, dependency management, environment configuration",
  "what_youll_do": "Create project structure, install dependencies, configure environment variables",
  "material_url": "https://storage-url/materials/task-1-guide.pdf",
  "created_at": "2024-01-15T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

**Indexes Needed:**
- `simulation_id` (for fetching tasks of a simulation)

---

### 5. TABLE: `user_task_progress`

**Purpose:** Tracks user progress on individual tasks (critical for internship module)

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique progress record ID |
| `user_id` | uuid | FOREIGN KEY (auth.users) | User ID |
| `simulation_id` | bigint | FOREIGN KEY (simulations) | Simulation ID |
| `task_id` | bigint | FOREIGN KEY (tasks) | Task ID |
| `status` | text | NOT NULL | Task status: "not_started", "in_progress", "completed" |
| `confirmation_status` | text | NULL allowed | Admin confirmation: "pending", "confirmed", "rejected" |
| `uploaded_work_url` | text | NULL allowed | URL to submitted work file |
| `comment` | text | NULL allowed | Admin feedback/comment |
| `updated_at` | timestamp | DEFAULT NOW() | Last status update |

**Sample Data:**
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "simulation_id": 1,
  "task_id": 1,
  "status": "completed",
  "confirmation_status": "pending",
  "uploaded_work_url": "https://storage-url/submissions/550e8400.../submission.pdf",
  "comment": null,
  "updated_at": "2024-12-13T11:45:00Z"
}
```

**Unique Constraint:**
- `(user_id, task_id)` - Composite unique key (one progress record per user per task)

**Indexes Needed:**
- `user_id` (for filtering by user)
- `simulation_id` (for filtering by simulation)
- `confirmation_status` (for filtering pending confirmations)
- `(user_id, simulation_id)` (for fetching user's progress in a simulation)

---

### 6. TABLE: `user_roles`

**Purpose:** Stores user role assignments (admin vs regular user)

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique role assignment ID |
| `user_id` | uuid | FOREIGN KEY (auth.users) | User ID |
| `role` | text | NOT NULL | Role type: "admin", "user" |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "user",
  "created_at": "2024-12-01T10:00:00Z"
}
```

**Indexes Needed:**
- `user_id` (for fast role lookup)

---

### 7. TABLE: `questions`

**Purpose:** Interview question bank for practice

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique question ID |
| `title` | text | NOT NULL | Question text/title |
| `category` | text | NOT NULL | Question category (e.g., "System Design", "Behavioral") |
| `company` | text | NOT NULL | Company/source (e.g., "Google", "Amazon") |
| `difficulty` | text | NOT NULL | Difficulty: "Easy", "Medium", "Hard" |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "title": "Design a URL shortening service like TinyURL",
  "category": "System Design",
  "company": "Google",
  "difficulty": "Hard",
  "created_at": "2024-01-10T00:00:00Z"
}
```

**Indexes Needed:**
- `category` (for filtering by category)
- `company` (for filtering by company)
- `difficulty` (for filtering by difficulty)

---

### 8. TABLE: `companies`

**Purpose:** Reference data for companies (used in job readiness assessments)

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique company ID |
| `name` | text | NOT NULL, UNIQUE | Company name |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "name": "Google",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Indexes Needed:**
- `name` (UNIQUE - for fast lookups and preventing duplicates)

---

### 9. TABLE: `role_levels`

**Purpose:** Reference data for job role levels (used in job readiness assessments)

**Columns:**

| Column Name | Type | Constraints | Description |
|-------------|------|-------------|------------|
| `id` | bigint | PRIMARY KEY, auto-increment | Unique role level ID |
| `name` | text | NOT NULL, UNIQUE | Role level (e.g., "Junior", "Senior", "Lead") |
| `created_at` | timestamp | DEFAULT NOW() | Record creation timestamp |

**Sample Data:**
```json
{
  "id": 1,
  "name": "Junior",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Indexes Needed:**
- `name` (UNIQUE - for fast lookups and preventing duplicates)

---

## STORAGE BUCKETS

### 1. Bucket: `resumes`

**Purpose:** User resume files

**Structure:**
```
resumes/
├── {user_id}/
│   ├── resume_1.pdf
│   ├── resume_2.pdf
│   └── {timestamp}_{filename}.pdf
```

**Usage:**
- Upload in: `MockInterviewForm.jsx`, `Forms.jsx`, `DocumentCenter.jsx`
- Access in: Multiple components for download/preview

---

### 2. Bucket: `submissions`

**Purpose:** Task submission files

**Structure:**
```
submissions/
├── task-submissions/
│   ├── {user_id}_{task_id}_{timestamp}.{ext}
│   └── {user_id}_{task_id}_{timestamp}.pdf
```

**Usage:**
- Upload in: `WorkUpload.jsx`
- Access in: `Confirmation.jsx` (admin review)

---

### 3. Bucket: `task-materials`

**Purpose:** Task instruction/material files

**Structure:**
```
task-materials/
├── task-{simulation_id}-{task_number}-{timestamp}.{ext}
└── task-{simulation_id}-{task_number}-{timestamp}.pdf
```

**Usage:**
- Upload in: `AddInternship.jsx` (admin)
- Access in: Task detail pages

---

## RELATIONSHIPS

### Foreign Key Relationships:

```
user_roles.user_id ──→ auth.users.id
interview.user_id ──→ auth.users.id
job_readiness_assessments.user_id ──→ auth.users.id
job_readiness_assessments.role_level_id ──→ role_levels.id
job_readiness_assessments.company_id ──→ companies.id
user_task_progress.user_id ──→ auth.users.id
user_task_progress.simulation_id ──→ simulations.id
user_task_progress.task_id ──→ tasks.id
tasks.simulation_id ──→ simulations.id
```

### Key Relationships Summary:

| Relation | Type | Description |
|----------|------|-------------|
| `users` → `interview` | 1-to-Many | One user has multiple interviews |
| `users` → `job_readiness_assessments` | 1-to-Many | One user has multiple assessments |
| `users` → `user_task_progress` | 1-to-Many | One user has multiple task progress records |
| `simulations` → `tasks` | 1-to-Many | One simulation has multiple tasks |
| `tasks` → `user_task_progress` | 1-to-Many | One task can be done by multiple users |
| `companies` → `job_readiness_assessments` | 1-to-Many | One company in multiple assessments |
| `role_levels` → `job_readiness_assessments` | 1-to-Many | One role level in multiple assessments |

---

## RECREATION INSTRUCTIONS

### Step 1: Enable Auth
1. Go to Supabase Dashboard
2. Navigate to **Authentication → Users**
3. Users will be auto-created via your auth system

### Step 2: Create Tables

Run these SQL commands in the Supabase SQL Editor:

```sql
-- 1. Create companies table
CREATE TABLE companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create role_levels table
CREATE TABLE role_levels (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create user_roles table
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create interview table
CREATE TABLE interview (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview TEXT,
  position TEXT,
  status TEXT,
  appointment TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create job_readiness_assessments table
CREATE TABLE job_readiness_assessments (
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

-- 6. Create simulations table
CREATE TABLE simulations (
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

-- 7. Create tasks table
CREATE TABLE tasks (
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

-- 8. Create user_task_progress table
CREATE TABLE user_task_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id BIGINT NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  confirmation_status TEXT,
  uploaded_work_url TEXT,
  comment TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- 9. Create questions table
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  company TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 3: Create Indexes

```sql
-- interview table indexes
CREATE INDEX idx_interview_user_id ON interview(user_id);
CREATE INDEX idx_interview_status ON interview(status);

-- job_readiness_assessments indexes
CREATE INDEX idx_assessments_user_id ON job_readiness_assessments(user_id);
CREATE INDEX idx_assessments_company_id ON job_readiness_assessments(company_id);
CREATE INDEX idx_assessments_role_level_id ON job_readiness_assessments(role_level_id);

-- simulations indexes
CREATE INDEX idx_simulations_category ON simulations(category);
CREATE INDEX idx_simulations_difficulty ON simulations(difficulty);

-- tasks indexes
CREATE INDEX idx_tasks_simulation_id ON tasks(simulation_id);

-- user_task_progress indexes
CREATE INDEX idx_progress_user_id ON user_task_progress(user_id);
CREATE INDEX idx_progress_simulation_id ON user_task_progress(simulation_id);
CREATE INDEX idx_progress_confirmation_status ON user_task_progress(confirmation_status);
CREATE INDEX idx_progress_user_simulation ON user_task_progress(user_id, simulation_id);

-- user_roles indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- questions indexes
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_company ON questions(company);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
```

### Step 4: Create Storage Buckets

1. Go to Supabase Dashboard → Storage
2. Create 3 new buckets:
   - `resumes` (public bucket)
   - `submissions` (public bucket)
   - `task-materials` (public bucket)

### Step 5: Set Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_progress ENABLE ROW LEVEL SECURITY;

-- user_roles policies
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- interview policies
CREATE POLICY "Users can view their own interviews" ON interview
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert interviews" ON interview
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- job_readiness_assessments policies
CREATE POLICY "Users can view their own assessments" ON job_readiness_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert assessments" ON job_readiness_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_task_progress policies
CREATE POLICY "Users can view their own progress" ON user_task_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own progress" ON user_task_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_task_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access to simulations, tasks, companies, role_levels, questions
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view simulations" ON simulations FOR SELECT USING (true);
CREATE POLICY "Anyone can view tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Anyone can view role_levels" ON role_levels FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);
```

### Step 6: Insert Reference Data

```sql
-- Insert role levels
INSERT INTO role_levels (name) VALUES 
  ('Intern'),
  ('Junior'),
  ('Mid-Level'),
  ('Senior'),
  ('Lead'),
  ('Manager');

-- Insert some sample companies
INSERT INTO companies (name) VALUES 
  ('Google'),
  ('Amazon'),
  ('Microsoft'),
  ('Meta'),
  ('Apple'),
  ('Tesla'),
  ('Netflix');
```

### Step 7: Verify Setup

Run these queries to verify:

```sql
-- Check table counts
SELECT COUNT(*) as companies_count FROM companies;
SELECT COUNT(*) as role_levels_count FROM role_levels;
SELECT COUNT(*) as simulations_count FROM simulations;
SELECT COUNT(*) as tasks_count FROM tasks;
SELECT COUNT(*) as questions_count FROM questions;
SELECT COUNT(*) as interviews_count FROM interview;
SELECT COUNT(*) as user_roles_count FROM user_roles;
SELECT COUNT(*) as assessments_count FROM job_readiness_assessments;
SELECT COUNT(*) as progress_count FROM user_task_progress;
```

---

## USAGE NOTES

### Key Points for Each Module:

**Mock Interview Module:**
- Records stored in `interview` table
- Resume uploaded to `resumes` bucket
- Updates interview history immediately after completion

**Job Readiness Module:**
- Records stored in `job_readiness_assessments` table
- Links to `companies` and `role_levels` via foreign keys
- Resume uploaded to `resumes` bucket

**Internship Simulations Module:**
- Simulations stored in `simulations` table
- Tasks stored in `tasks` table
- User progress tracked in `user_task_progress` table
- Task materials stored in `task-materials` bucket
- Submissions stored in `submissions` bucket
- Requires composite unique constraint on `(user_id, task_id)` for proper upsert operations

**Question Bank:**
- Questions stored in `questions` table
- Used for practice interview questions

**User Management:**
- User roles stored in `user_roles` table
- Authenticated via Supabase Auth (not in these tables)

---

## Composite Keys & Constraints Summary

| Table | Unique Constraint | Composite? |
|-------|------------------|-----------|
| `user_task_progress` | `(user_id, task_id)` | ✅ YES |
| `user_roles` | `user_id` | ❌ NO |
| `companies` | `name` | ❌ NO |
| `role_levels` | `name` | ❌ NO |

---

## Important: RLS & Security

- All user-specific tables have RLS enabled
- Public tables (simulations, tasks, questions, etc.) allow public read access
- Storage buckets should be public for file access
- Admin operations need proper RLS policies (not shown above - implement based on your admin role requirements)

---

**Last Updated:** December 13, 2024  
**Database Status:** Corrupted (Requires Regeneration)  
**Regeneration Status:** Ready for Execution

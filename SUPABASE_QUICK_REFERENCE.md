# Supabase Database - Quick Reference Guide

## 9 Tables at a Glance

| # | Table Name | Purpose | Key Fields | Relations |
|---|---|---|---|---|
| 1 | `user_roles` | User role assignments | user_id, role | → auth.users |
| 2 | `interview` | Mock interview records | user_id, position, status, resume_url | → auth.users |
| 3 | `job_readiness_assessments` | Job readiness data | user_id, position, role_level_id, company_id, resume_url | → auth.users, role_levels, companies |
| 4 | `simulations` | Internship projects | title, description, category, difficulty, duration | - |
| 5 | `tasks` | Simulation tasks | simulation_id, title, duration, difficulty, description | → simulations |
| 6 | `user_task_progress` | User task progress | user_id, task_id, simulation_id, status, confirmation_status | → auth.users, simulations, tasks |
| 7 | `questions` | Question bank | title, category, company, difficulty | - |
| 8 | `companies` | Company reference | name | - |
| 9 | `role_levels` | Role level reference | name | - |

---

## 3 Storage Buckets

| Bucket Name | Purpose | Structure |
|---|---|---|
| `resumes` | User resume files | `{user_id}/{filename}.pdf` |
| `submissions` | Task submissions | `task-submissions/{user_id}_{task_id}_{timestamp}.ext` |
| `task-materials` | Task materials | `task-{sim_id}-{task_no}-{timestamp}.ext` |

---

## Module-to-Table Mapping

```
┌─ Mock Interview Module
│  ├─ interview (stores session data)
│  ├─ resumes (bucket - resume files)
│  └─ video call logs (in-memory only)
│
├─ Job Readiness Module
│  ├─ job_readiness_assessments (assessment records)
│  ├─ role_levels (reference)
│  ├─ companies (reference)
│  └─ resumes (bucket - resume files)
│
├─ Internship Simulations Module
│  ├─ simulations (project records)
│  ├─ tasks (task records)
│  ├─ user_task_progress (progress tracking)
│  ├─ task-materials (bucket - instructions)
│  └─ submissions (bucket - work submissions)
│
├─ Question Bank Module
│  └─ questions (practice questions)
│
└─ Auth & Admin
   ├─ user_roles (role assignments)
   └─ auth.users (managed by Supabase Auth)
```

---

## Data Type Summary

```
UUIDs      → user_id (from auth.users)
BIGSERIAL  → Auto-increment IDs
TEXT       → Text content (unlimited)
FLOAT      → Ratings
TIMESTAMP  → Dates/times (DEFAULT NOW())
```

---

## Critical Unique Constraints

```
user_task_progress: UNIQUE(user_id, task_id)
  → Ensures one progress record per user per task
  → Enables safe upsert operations

companies: UNIQUE(name)
  → Prevents duplicate company entries
  → Used for getOrCreate pattern

role_levels: UNIQUE(name)
  → Prevents duplicate role level entries
  → Used for getOrCreate pattern
```

---

## Foreign Key Cascade Rules

```
ON DELETE CASCADE  → Deletes dependent records
  - interview, job_readiness_assessments, user_task_progress 
    (if user deleted, all their records deleted)
  - tasks (if simulation deleted, all tasks deleted)
  - user_task_progress (if task deleted, all progress deleted)

ON DELETE SET NULL → Sets FK to NULL
  - job_readiness_assessments.role_level_id
  - job_readiness_assessments.company_id
```

---

## Status Values (Enums)

### interview.status
- `Completed`
- `Pending`

### interview.interview (type)
- `Mock Interview`
- `Job Readiness Assessment`

### user_task_progress.status
- `not_started`
- `in_progress`
- `completed`

### user_task_progress.confirmation_status
- `pending`
- `confirmed`
- `rejected`

### user_roles.role
- `user`
- `admin`

### questions.difficulty
- `Easy`
- `Medium`
- `Hard`

### simulations.difficulty / tasks.difficulty
- `Beginner`
- `Intermediate`
- `Advanced`

---

## Common Queries Used in Code

### Fetch User's Interviews
```javascript
supabase
  .from('interview')
  .select('*')
  .eq('user_id', user.id)
```

### Fetch User's Task Progress
```javascript
supabase
  .from('user_task_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('simulation_id', simulationId)
```

### Fetch Simulations with Tasks
```javascript
supabase
  .from('simulations')
  .select('*')

supabase
  .from('tasks')
  .select('*')
  .eq('simulation_id', simulationId)
```

### Update Task Progress (Upsert)
```javascript
supabase
  .from('user_task_progress')
  .upsert({
    user_id, simulation_id, task_id, status, ...
  }, {
    onConflict: 'user_id,task_id'
  })
```

### Fetch Job Readiness with Relations
```javascript
supabase
  .from('job_readiness_assessments')
  .select('id, position, companies(name)')
  .eq('user_id', user.id)
```

---

## Recreate Database in 5 Steps

1. **Copy SQL from SUPABASE_DATABASE_SCHEMA.md** → Step 2 (Create Tables)
2. **Run in Supabase SQL Editor** to create all tables
3. **Copy SQL from Step 3** (Create Indexes) and run
4. **Create 3 buckets** in Storage: resumes, submissions, task-materials
5. **Copy RLS policies** from Step 5 and apply

**Estimated Time:** 10-15 minutes

---

## File-to-Module Dependencies

```
Auth
├─ src/components/Auth/AuthContext.jsx → user session
├─ src/components/Auth/signin.jsx → user_roles lookup
└─ src/components/Auth/signup.jsx → (would create user_roles)

Mock Interview
├─ src/components/mock/MockInterviewForm.jsx → interview table, resumes bucket
├─ src/components/mock/VideoCallContent.jsx → interview table
└─ src/components/mock/Feedback.jsx → (feedback not stored)

Job Readiness
├─ src/components/job_readiness/Forms.jsx → job_readiness_assessments, role_levels, companies
├─ src/components/job_readiness/JobReadinessAssessment.jsx → interview table
└─ src/components/job_readiness/JobReadinessGoalSelector.jsx → job_readiness_assessments

Internship Simulations
├─ src/components/admin/AddInternship.jsx → simulations, tasks, task-materials bucket
├─ src/components/internship/WorkUpload.jsx → user_task_progress, submissions bucket
├─ src/components/internship/SimulationDetail.jsx → user_task_progress
├─ src/components/internship/ProgressPage.jsx → user_task_progress
└─ src/components/admin/SimulationsManager.jsx → simulations, tasks

Questions
├─ src/components/practicing_questions/PracticingQuestions.jsx → questions table
└─ src/components/admin/AddQuestionBank.jsx → questions table

Admin
├─ src/components/admin/Confirmation.jsx → user_task_progress, submissions bucket
└─ src/components/admin/AddInternship.jsx → simulations, tasks

Utilities
├─ src/components/utils/simulations.js → simulations, tasks, user_task_progress
├─ src/components/utils/uploadResume.js → resumes bucket
└─ src/components/utils/supabaseClient.js → client initialization
```

---

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| user_roles | User own | - | - | - |
| interview | User own | User own | - | - |
| job_readiness_assessments | User own | User own | - | - |
| user_task_progress | User own | User own | User own | - |
| simulations | Public | - | - | - |
| tasks | Public | - | - | - |
| questions | Public | - | - | - |
| companies | Public | - | - | - |
| role_levels | Public | - | - | - |

---

## Before & After Corruption

✅ **Before:** Database had 9 tables with proper schemas and constraints  
❌ **After Corruption:** All tables lost or corrupted  
🔧 **Recovery:** Use provided SQL scripts to recreate from scratch

---

## Testing the Recreation

After recreating, test with:

```sql
-- Count rows in each table
SELECT 'user_roles' as table_name, COUNT(*) FROM user_roles UNION ALL
SELECT 'interview', COUNT(*) FROM interview UNION ALL
SELECT 'job_readiness_assessments', COUNT(*) FROM job_readiness_assessments UNION ALL
SELECT 'simulations', COUNT(*) FROM simulations UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks UNION ALL
SELECT 'user_task_progress', COUNT(*) FROM user_task_progress UNION ALL
SELECT 'questions', COUNT(*) FROM questions UNION ALL
SELECT 'companies', COUNT(*) FROM companies UNION ALL
SELECT 'role_levels', COUNT(*) FROM role_levels;

-- Should see 7 rows with initial counts (mostly 0 except role_levels and companies with seed data)
```

---

**Generated:** December 13, 2024  
**For:** Quantiverse MockInterview Project  
**Status:** Ready to Restore Database

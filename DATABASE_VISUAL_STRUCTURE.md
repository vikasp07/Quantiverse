# 🗄️ Supabase Database - Visual Data Structure

**Generated:** December 13, 2024

---

## 📊 Database Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUANTIVERSE SUPABASE DATABASE                │
│                                                                  │
│  ┌──────────────────┐                                            │
│  │  auth.users      │ (Managed by Supabase Auth)                 │
│  │  (external)      │                                            │
│  ├──────────────────┤                                            │
│  │ id (UUID)        │                                            │
│  │ email            │                                            │
│  │ created_at       │                                            │
│  └────────┬─────────┘                                            │
│           │                                                      │
│      ┌────┴────────────────────────────────────────────┐        │
│      │                                                 │        │
│      ▼                                                 ▼        │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ user_roles  │  │  interview       │  │ job_readiness_   │   │
│  ├─────────────┤  ├──────────────────┤  │ assessments      │   │
│  │ id          │  │ id               │  ├──────────────────┤   │
│  │ user_id ◆───  │ user_id ◆────────┐  │ id               │   │
│  │ role        │  │ interview        │  │ user_id ◆────────┼────┐
│  │ created_at  │  │ position         │  │ position         │    │
│  └─────────────┘  │ status           │  │ role_level_id ◆──┐   │
│                   │ appointment      │  │ company_id ◆─────┼┐  │
│                   │ resume_url       │  │ job_description  ││  │
│                   │ created_at       │  │ company_details  ││  │
│                   └──────────────────┘  │ resume_url       ││  │
│                          │              │ created_at       ││  │
│                          │              │ updated_at       ││  │
│                          │              └──────────────────┘│  │
│                          │                                 │  │
│  (Resume Storage)        │              ┌─────────────┐   │  │
│  ┌────────────────────┐  │              │role_levels  │◄──┘  │
│  │ resumes/           │  │              ├─────────────┤      │
│  │ {user_id}/         │  │              │ id          │      │
│  │   {filename}.pdf   │  │              │ name ◆      │      │
│  └────────────────────┘  │              │ created_at  │      │
│                          │              └─────────────┘      │
│                          │              ┌─────────────┐      │
│                          │              │companies    │◄─────┘
│                          │              ├─────────────┤
│                          │              │ id          │
│                          │              │ name ◆      │
│                          │              │ created_at  │
│                          │              └─────────────┘
│                          │
│                          └──────────────────────────┐
│                                                    │
│  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ simulations  │  │ user_task_progress        │  │
│  ├──────────────┤  ├───────────────────────────┤  │
│  │ id           │  │ id                        │  │
│  │ title        │  │ user_id ◆─────────────────┼──┘
│  │ description  │  │ simulation_id ◆────┐      │
│  │ category     │  │ task_id ◆──────┐   │      │
│  │ difficulty   │  │ status          │   │      │
│  │ duration     │  │ confirmation_   │   │      │
│  │ image        │  │   status        │   │      │
│  │ overview     │  │ uploaded_work_  │   │      │
│  │ features     │  │   url           │   │      │
│  │ skills       │  │ comment         │   │      │
│  │ rating       │  │ updated_at      │   │      │
│  │ created_at   │  └───────────────────┤ │      │
│  │ updated_at   │                       │ │      │
│  └───────┬──────┘                       │ │      │
│          │                              │ │      │
│          ▼                              │ │      │
│  ┌──────────────┐                      │ │      │
│  │ tasks        │◄─────────────────────┼─┘      │
│  ├──────────────┤                      │        │
│  │ id           │                      │        │
│  │ simulation_  │                      │        │
│  │   id ◆───────┼──────────────────────┴────────┘
│  │ title        │
│  │ full_title   │
│  │ duration     │
│  │ difficulty   │
│  │ description  │
│  │ what_youll_  │
│  │   learn      │
│  │ what_youll_  │
│  │   do         │
│  │ material_url │
│  │ created_at   │
│  │ updated_at   │
│  └──────────────┘
│
│  (Storage Buckets)
│  ┌──────────────────┐  ┌──────────────────┐
│  │submissions/      │  │task-materials/   │
│  │task-submissions/ │  │task-{id}-{ts}.*  │
│  │{id}_{ts}.*       │  └──────────────────┘
│  └──────────────────┘
│
│  ┌──────────────────┐
│  │ questions        │
│  ├──────────────────┤
│  │ id               │
│  │ title            │
│  │ category         │
│  │ company          │
│  │ difficulty       │
│  │ created_at       │
│  └──────────────────┘
│
└─────────────────────────────────────────────────────────────────┘

Legend:
  ◆  = Primary Key / Unique Constraint
  →  = Foreign Key Reference
  ◀  = Reverse Foreign Key Reference
```

---

## 📋 Table Relationship Matrix

```
                    ┌──────┬─────────┬──────┬──────────┬───────┬─────────┬────────┬────┬──────┐
                    │ user │interview│job_r │simul     │ tasks │user_task│question│co  │role_ │
                    │_roles│         │eadi  │ations    │       │_progress│        │mpan│level│
                    │      │         │ness_ │          │       │         │        │ies │     │
                    │      │         │asses │          │       │         │        │    │     │
                    │      │         │sments│          │       │         │        │    │     │
├────────────────────┼──────┼─────────┼──────┼──────────┼───────┼─────────┼────────┼────┼──────┤
│ user_roles         │   X  │         │      │          │       │         │        │    │      │
│ interview          │   1  │    X    │      │          │       │         │        │    │      │
│ job_readiness_     │   1  │         │  X   │          │       │         │        │ 1  │  1   │
│ assessments        │      │         │      │          │       │         │        │    │      │
│ simulations        │      │         │      │    X     │   1   │    1    │        │    │      │
│ tasks              │      │         │      │    1     │   X   │    1    │        │    │      │
│ user_task_progress │   1  │         │      │    1     │   1   │    X    │        │    │      │
│ questions          │      │         │      │          │       │         │    X   │    │      │
│ companies          │      │         │    1 │          │       │         │        │ X  │      │
│ role_levels        │      │         │    1 │          │       │         │        │    │  X   │
└────────────────────┴──────┴─────────┴──────┴──────────┴───────┴─────────┴────────┴────┴──────┘

Legend:
  X   = Table itself
  1   = Foreign key relationship (one-to-many)
  (blank) = No direct relationship
```

---

## 🔄 Data Flow Diagrams

### Mock Interview Module Flow

```
┌─────────────────────┐
│   User Selects      │
│   Interview Type    │
│   & Uploads Resume  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Resume Stored in  │
│   resumes bucket    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Interview Record   │
│  Created in         │
│  interview table    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Interview Data:   │
│ - user_id           │
│ - position          │
│ - interview type    │
│ - status: Complete  │
│ - resume_url        │
└─────────────────────┘
```

### Job Readiness Module Flow

```
┌──────────────────────────┐
│ User Enters Job Details  │
│ - Position               │
│ - Role Level             │
│ - Company                │
│ - Uploads Resume         │
└──────────┬───────────────┘
           │
           ├─ Role Level Checked/Created in role_levels table
           │
           ├─ Company Checked/Created in companies table
           │
           ▼
┌──────────────────────────────────┐
│ job_readiness_assessments Record │
│ - user_id                        │
│ - position                       │
│ - role_level_id (foreign key)    │
│ - company_id (foreign key)       │
│ - resume_url                     │
└──────────────────────────────────┘
```

### Internship Simulations Module Flow

```
┌──────────────────────┐
│  Admin Adds New      │
│  Internship Project  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  simulations Record  │
│ - title              │
│ - description        │
│ - category           │
│ - difficulty         │
│ - skills             │
└──────────┬───────────┘
           │
           ├─ For each task:
           │  ├─► Task Record in tasks table
           │  │   - simulation_id (foreign key)
           │  │   - title
           │  │   - material_url (in task-materials bucket)
           │  │
           │  └─► When user starts task:
           │      └─► user_task_progress Record
           │          - user_id
           │          - simulation_id
           │          - task_id
           │          - status: in_progress
           │
           └─ When user submits work:
              └─► Update user_task_progress
                  - status: completed
                  - confirmation_status: pending
                  - uploaded_work_url (in submissions bucket)
                  - comment: awaiting admin review
```

---

## 📊 Field Type Distribution

```
TEXT fields (unlimited length)
├─ interview: interview, position, appointment, resume_url
├─ job_readiness_assessments: position, job_description, company_details, resume_url
├─ simulations: title, description, category, difficulty, duration, image, overview, features, skills
├─ tasks: title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url
├─ user_task_progress: status, confirmation_status, uploaded_work_url, comment
├─ questions: title, category, company, difficulty
├─ companies: name
├─ role_levels: name
└─ user_roles: role
   Total: 46 TEXT fields

BIGSERIAL/BIGINT (auto-increment IDs)
├─ All tables have one as primary key (9)
├─ Foreign keys: 8
└─ Total: 17 fields

UUID (user identification)
├─ user_id fields in: user_roles, interview, job_readiness_assessments, user_task_progress
└─ Total: 4 fields

FLOAT (ratings)
└─ simulations: rating
   Total: 1 field

TIMESTAMP (dates)
├─ created_at: all 9 tables
├─ updated_at: simulations, tasks, job_readiness_assessments
└─ Total: 12 fields

Total Fields by Type:
━━━━━━━━━━━━━━━━━━━━━━━
TEXT       │ 46 (75%)
BIGINT     │ 17 (28%)
UUID       │ 4 (7%)
FLOAT      │ 1 (2%)
TIMESTAMP  │ 12 (20%)
━━━━━━━━━━━━━━━━━━━━━━━
Total      │ 61 fields
```

---

## 🔗 Foreign Key Chain Example

**Scenario:** User completes internship task

```
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE RECORD CHAIN                    │
└─────────────────────────────────────────────────────────────┘

auth.users
┌────────────────────┐
│ id: 550e8400-...   │  ◄─── External (managed by Supabase Auth)
│ email: user@...    │
└────┬───────────────┘
     │
     │ Foreign Key Reference
     ▼
user_task_progress
┌─────────────────────────────────────────┐
│ user_id: 550e8400-... ◆                 │  ◄─── Belongs to user
│ simulation_id: 1 ◆                      │
│ task_id: 3 ◆                           │
│ status: completed                       │
│ confirmation_status: pending            │
│ uploaded_work_url: https://...          │
└─────┬─────────────────────────────────┬─┘
      │                                 │
      │ Foreign Key                    │ Foreign Key
      │ Reference                      │ Reference
      ▼                                 ▼
   simulations                         tasks
┌────────────────┐                ┌────────────────────┐
│ id: 1 ◆        │                │ id: 3 ◆            │
│ title: ...     │                │ simulation_id: 1 ◆ │
│ description... │                │ title: ...         │
│ category: ...  │                │ description: ...   │
└────────────────┘                │ material_url: ...  │
                                  └────────────────────┘

Storage Buckets:
┌────────────────────────────┐
│ submissions/               │
│   task-submissions/        │
│   550e8400_3_timestamp.pdf │  ◄─── Uploaded work file
└────────────────────────────┘

┌────────────────────────────┐
│ task-materials/            │
│   task-1-3-timestamp.pdf   │  ◄─── Task materials file
└────────────────────────────┘
```

---

## 📈 Data Cardinality

```
One-to-Many Relationships:

auth.users (1) ──────► (Many) user_roles
auth.users (1) ──────► (Many) interview
auth.users (1) ──────► (Many) job_readiness_assessments
auth.users (1) ──────► (Many) user_task_progress

companies (1) ────────► (Many) job_readiness_assessments
role_levels (1) ──────► (Many) job_readiness_assessments

simulations (1) ──────► (Many) tasks
simulations (1) ──────► (Many) user_task_progress

tasks (1) ────────────► (Many) user_task_progress
```

---

## 🎯 Index Strategy

```
High Frequency Queries (indexes needed):

1. Filter by user_id
   ├─ user_roles(user_id)
   ├─ interview(user_id)
   ├─ job_readiness_assessments(user_id)
   └─ user_task_progress(user_id)

2. Composite lookups
   ├─ user_task_progress(user_id, simulation_id)
   └─ user_task_progress(user_id, task_id) - UNIQUE

3. Filter by status/category
   ├─ interview(status)
   ├─ simulations(category)
   ├─ simulations(difficulty)
   ├─ user_task_progress(status)
   └─ user_task_progress(confirmation_status)

4. Sort and pagination
   ├─ questions(category, company, difficulty)
   └─ (All tables by created_at)
```

---

## 🔐 Access Control Model

```
┌──────────────────────────────────────────┐
│         Row Level Security (RLS)         │
└──────────────────────────────────────────┘

User-Specific Tables (Authenticated Users Only):
┌─────────────────────────────────────────────┐
│ Policy: auth.uid() = user_id               │
├─────────────────────────────────────────────┤
│ ✓ user_roles       (SELECT only)           │
│ ✓ interview        (SELECT, INSERT)        │
│ ✓ job_readiness_   (SELECT, INSERT)        │
│   assessments                              │
│ ✓ user_task_      (SELECT, INSERT, UPDATE)│
│   progress                                 │
└─────────────────────────────────────────────┘

Public Tables (All Users):
┌─────────────────────────────────────────────┐
│ Policy: TRUE (Public read access)          │
├─────────────────────────────────────────────┤
│ ✓ simulations      (SELECT only)           │
│ ✓ tasks            (SELECT only)           │
│ ✓ companies        (SELECT only)           │
│ ✓ role_levels      (SELECT only)           │
│ ✓ questions        (SELECT only)           │
└─────────────────────────────────────────────┘
```

---

## 💾 Storage Architecture

```
Supabase Storage (3 Buckets)

resumes/
├── 550e8400-e29b-41d4-a716-446655440000/
│   ├── resume_2024_01.pdf
│   ├── resume_2024_12_updated.pdf
│   └── {timestamp}_{original_name}.pdf
└── [other user IDs]/

submissions/
└── task-submissions/
    ├── 550e8400_1_1702469040123.pdf
    ├── 550e8400_2_1702469055234.pdf
    └── {user_id}_{task_id}_{timestamp}.{ext}

task-materials/
├── task-1-1-1702300000000.pdf
├── task-1-2-1702300001000.pdf
└── task-{sim_id}-{task_no}-{timestamp}.{ext}
```

---

## 📊 Typical Data Scale

```
Small Project (pilot)
- Users: 10-50
- Simulations: 2-5
- Tasks per Simulation: 3-5 (total: 10-25)
- Questions: 50-100
- Companies: 5-10

Medium Project (active)
- Users: 100-500
- Simulations: 10-20
- Tasks per Simulation: 3-5 (total: 30-100)
- Questions: 200-500
- Companies: 20-50

Large Project (production)
- Users: 1000-5000+
- Simulations: 50-100+
- Tasks per Simulation: 3-5 (total: 150-500+)
- Questions: 1000+
- Companies: 100+
```

---

**Last Updated:** December 13, 2024  
**Format:** ASCII Diagrams + Data Structure Maps  
**Purpose:** Visual understanding of database architecture

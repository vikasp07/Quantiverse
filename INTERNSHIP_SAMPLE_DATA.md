# 📝 Sample Database Data & Setup Guide for Internship Module

**Purpose:** Populate your database with test data to see internship module in action

---

## 1️⃣ STEP 1: Create Test Users in Supabase Auth

### **Method A: Via Application (Recommended)**

```
1. Open http://localhost:5173/signup
2. Create Admin User:
   - Email: admin@test.com
   - Password: Admin@123456
   - Full Name: Admin User
   - Phone: 9876543210

3. Create Student User 1:
   - Email: student1@test.com
   - Password: Student@123456
   - Full Name: John Doe
   - Phone: 9876543210

4. Create Student User 2:
   - Email: student2@test.com
   - Password: Student@123456
   - Full Name: Jane Smith
   - Phone: 9876543210
```

**After signing up:**

- Users are created in `auth.users` table
- Copy their **user_id** (UUID) from auth.users table

---

## 2️⃣ STEP 2: Create User Roles

After creating users, add them to `user_roles` table via Supabase SQL Editor:

```sql
-- Get UUIDs from auth.users first, then use them here:

-- Add ADMIN role
INSERT INTO user_roles (user_id, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin');

-- Add STUDENT roles
INSERT INTO user_roles (user_id, role)
VALUES ('660e8400-e29b-41d4-a716-446655440001', 'user');

INSERT INTO user_roles (user_id, role)
VALUES ('770e8400-e29b-41d4-a716-446655440002', 'user');
```

**Note:** Replace UUIDs with actual values from your auth.users table.

---

## 3️⃣ STEP 3: Insert Test Simulations

Run this SQL to add sample internship projects:

```sql
-- Simulation 1: Web Development
INSERT INTO simulations
(title, description, category, difficulty, duration, image, overview, features, skills, rating)
VALUES (
  'E-Commerce Platform Development',
  'Build a full-stack e-commerce platform with payment integration, user authentication, and product management system.',
  'Software Development',
  'Advanced',
  '1-2 months',
  'https://via.placeholder.com/300x200?text=Ecommerce',
  'Create a complete e-commerce solution from scratch including frontend, backend, database, and payment gateway integration.',
  'Product Management System, Shopping Cart, User Authentication, Payment Gateway Integration, Order Management, Admin Dashboard',
  'React, Node.js, MongoDB, Express.js, Stripe API, JWT Authentication, REST APIs',
  NULL
);

-- Simulation 2: Mobile App Development
INSERT INTO simulations
(title, description, category, difficulty, duration, image, overview, features, skills, rating)
VALUES (
  'Mobile Task Management App',
  'Develop a cross-platform mobile app for task management with real-time synchronization and offline support.',
  'Mobile Development',
  'Intermediate',
  '2-3 weeks',
  'https://via.placeholder.com/300x200?text=Mobile',
  'Build a mobile app that helps users manage their daily tasks with cloud synchronization and offline capabilities.',
  'Task Creation and Management, Real-time Sync, Offline Support, User Authentication, Cloud Storage',
  'React Native, Firebase, Redux, JavaScript, Mobile Development',
  NULL
);

-- Simulation 3: Data Analytics
INSERT INTO simulations
(title, description, category, difficulty, duration, image, overview, features, skills, rating)
VALUES (
  'Sales Analytics Dashboard',
  'Create an interactive analytics dashboard that visualizes sales data, trends, and provides actionable insights.',
  'Data Analytics',
  'Intermediate',
  '1-2 weeks',
  'https://via.placeholder.com/300x200?text=Analytics',
  'Build a comprehensive dashboard that analyzes sales metrics, customer behavior, and provides business insights.',
  'Data Visualization, Real-time Metrics, Sales Analysis, Report Generation, Data Filtering',
  'Python, Pandas, Matplotlib, Plotly, SQL, Tableau',
  NULL
);

-- Simulation 4: UI/UX Design
INSERT INTO simulations
(title, description, category, difficulty, duration, image, overview, features, skills, rating)
VALUES (
  'Redesign Social Media Platform',
  'Complete UI/UX redesign of a social media platform with modern design principles and user research.',
  'Design',
  'Advanced',
  '3-4 weeks',
  'https://via.placeholder.com/300x200?text=Design',
  'Redesign a social platform with focus on user experience, accessibility, and modern design patterns.',
  'User Research, Wireframing, High-Fidelity Mockups, Design System, Prototyping, User Testing',
  'Figma, Adobe XD, User Research, Design Thinking, Prototyping',
  NULL
);
```

**Check:** Run `SELECT * FROM simulations;` to verify

---

## 4️⃣ STEP 4: Insert Tasks for Each Simulation

### **Simulation 1: E-Commerce Platform - Tasks**

```sql
-- Task 1
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  1,
  'Task One',
  'Setup Project Repository and Development Environment',
  '30-60 mins',
  'Beginner',
  'Initialize the project repository with proper folder structure, install dependencies, configure environment variables, and set up version control.',
  'Project initialization, Git workflow, Environment configuration, Dependency management, Development setup',
  'Create GitHub repository, Clone and setup locally, Install Node.js dependencies, Configure .env file, Setup git hooks',
  NULL
);

-- Task 2
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  1,
  'Task Two',
  'Design and Create Database Schema',
  '1-2 hours',
  'Intermediate',
  'Design the database schema for products, users, orders, and transactions. Create collections/tables and set up relationships.',
  'Database design, Relational modeling, Indexing, Schema optimization, Data integrity',
  'Design ER diagram, Create MongoDB collections or SQL tables, Define relationships, Setup indexes, Add validation',
  NULL
);

-- Task 3
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  1,
  'Task Three',
  'Build Authentication System',
  '1-2 hours',
  'Intermediate',
  'Implement user registration, login, and JWT-based authentication system with secure password hashing.',
  'JWT authentication, Password security, Session management, Authorization, Security best practices',
  'Create registration endpoint, Create login endpoint, Implement JWT token generation, Add password hashing, Setup authentication middleware',
  NULL
);

-- Task 4
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  1,
  'Task Four',
  'Implement Shopping Cart Functionality',
  '1-2 hours',
  'Intermediate',
  'Create shopping cart features including add/remove items, update quantities, and calculate totals.',
  'State management, Cart logic, Price calculation, API design, Data validation',
  'Create cart endpoints, Implement add to cart, Implement remove from cart, Calculate totals, Handle inventory',
  NULL
);

-- Task 5
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  1,
  'Task Five',
  'Integrate Payment Gateway',
  '2-3 hours',
  'Advanced',
  'Integrate Stripe or PayPal payment gateway to process orders securely with proper error handling.',
  'Payment processing, Stripe API, Security, Error handling, Transaction management',
  'Setup Stripe account, Integrate Stripe API, Create payment endpoint, Handle payment responses, Test transactions',
  NULL
);
```

### **Simulation 2: Mobile App - Tasks**

```sql
-- Task 1
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  2,
  'Task One',
  'Setup React Native Project and Navigation',
  '45-60 mins',
  'Beginner',
  'Initialize React Native project and set up navigation structure.',
  'React Native basics, Navigation setup, Project structure, Expo framework',
  'Create new RN project, Install navigation libraries, Setup stack navigation, Create basic screens',
  NULL
);

-- Task 2
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  2,
  'Task Two',
  'Create Task Input and Management UI',
  '1-2 hours',
  'Intermediate',
  'Build UI components for creating, editing, and deleting tasks.',
  'React Native components, State management, User input handling, UI design',
  'Create task input form, Build task list component, Implement edit functionality, Add delete buttons',
  NULL
);

-- Task 3
INSERT INTO tasks
(simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES (
  2,
  'Task Three',
  'Implement Firebase Integration',
  '1-2 hours',
  'Intermediate',
  'Connect Firebase for real-time data synchronization and user authentication.',
  'Firebase setup, Real-time database, Authentication, Data sync',
  'Setup Firebase project, Configure authentication, Setup Firestore database, Test data sync',
  NULL
);
```

---

## 5️⃣ STEP 5: Check What You've Created

```sql
-- View all simulations
SELECT id, title, category, difficulty FROM simulations;

-- View all tasks
SELECT id, simulation_id, title, difficulty FROM tasks;

-- Should see:
-- Simulations: 4 rows
-- Tasks: 3 + 3 = at least 6 rows
```

---

## 6️⃣ STEP 6: Insert User Profile Data (Optional but Recommended)

Create the `user_profiles` table first:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  phone_no text,
  email text NOT NULL UNIQUE,
  profile_picture text,
  bio text,
  is_verified boolean DEFAULT false,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);
```

Then insert data:

```sql
-- Insert admin profile
INSERT INTO user_profiles (id, display_name, phone_no, email, is_verified)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', '9876543210', 'admin@test.com', true);

-- Insert student profiles
INSERT INTO user_profiles (id, display_name, phone_no, email, is_verified)
VALUES ('660e8400-e29b-41d4-a716-446655440001', 'John Doe', '9876543210', 'student1@test.com', true);

INSERT INTO user_profiles (id, display_name, phone_no, email, is_verified)
VALUES ('770e8400-e29b-41d4-a716-446655440002', 'Jane Smith', '9876543210', 'student2@test.com', true);
```

---

## 7️⃣ STEP 7: TEST THE SYSTEM

### **Test As Admin:**

```
1. Login: http://localhost:5173/signin
   Email: admin@test.com
   Password: Admin@123456

2. You should see Admin Dashboard
3. Click "Add Internship" in sidebar
4. You can see the form to create more simulations
```

### **Test As Student:**

```
1. Login: http://localhost:5173/signin
   Email: student1@test.com
   Password: Student@123456

2. You should see Student Dashboard
3. Navigate to Internship section (sidebar)
4. You should see all 4 simulations
5. Click on one to view details
6. Click "Start Program" button
7. You're now on task page - can upload files
```

### **Test Student Progress:**

```
1. After uploading a file, go to /progress
2. You should see:
   - Simulation name
   - All tasks
   - Submission status (Completed)
   - Confirmation status (Pending)

3. As admin, go to /confirmation
4. You should see student's submission
5. Can download file and approve/reject
```

---

## 📊 Expected Database State After Setup

```
auth.users
├── admin@test.com (Admin User)
├── student1@test.com (John Doe)
└── student2@test.com (Jane Smith)

user_roles
├── admin@test.com → 'admin'
├── student1@test.com → 'user'
└── student2@test.com → 'user'

user_profiles (Optional)
├── admin@test.com → Admin User profile
├── student1@test.com → John Doe profile
└── student2@test.com → Jane Smith profile

simulations (4 total)
├── E-Commerce Platform (5 tasks)
├── Mobile App (3 tasks)
├── Data Analytics (3 tasks)
└── UI/UX Design (3 tasks)

tasks (14 total)
├── All tasks linked to their simulations
└── All with descriptions and learning objectives

user_task_progress (empty until students start)
└── Will populate as students submit work
```

---

## 🎯 Common SQL Queries for Testing

```sql
-- Check if user roles exist
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN user_roles r ON u.id = r.user_id;

-- Check all simulations and task count
SELECT s.id, s.title, COUNT(t.id) as task_count
FROM simulations s
LEFT JOIN tasks t ON s.id = t.simulation_id
GROUP BY s.id, s.title;

-- Check all pending submissions
SELECT
  utp.id,
  u.email,
  s.title as simulation,
  t.title as task,
  utp.status,
  utp.confirmation_status
FROM user_task_progress utp
JOIN auth.users u ON utp.user_id = u.id
JOIN simulations s ON utp.simulation_id = s.id
JOIN tasks t ON utp.task_id = t.id
WHERE utp.confirmation_status = 'pending';

-- Check all completed tasks awaiting confirmation
SELECT
  COUNT(*) as pending_reviews
FROM user_task_progress
WHERE status = 'completed'
AND confirmation_status = 'pending';
```

---

## 🔧 Troubleshooting

### **Problem: Simulations don't appear in student view**

```
Solution:
1. Check: SELECT * FROM simulations;
2. Verify: simulations table has data
3. Check: Firebase/Supabase connection in code
4. Check browser console for errors
```

### **Problem: Admin can't create simulation**

```
Solution:
1. Verify user is in user_roles with role='admin'
2. Check: User is actually logged in
3. Check: No validation errors in form
4. Check database permissions (RLS policies)
```

### **Problem: Student can't upload file**

```
Solution:
1. Check file size < 10MB
2. Verify: submissions bucket exists in Storage
3. Check: Supabase Storage permissions are set correctly
4. Verify: User is authenticated
```

### **Problem: Confirmation page shows nothing**

```
Solution:
1. Verify: At least one student has submitted work
2. Check: confirmation_status is 'pending' in user_task_progress
3. Check: User is logged in as admin
4. Verify: RLS policies allow admin to read all submissions
```

---

## 📝 SQL Script - Complete Setup (All in One)

Save this as `setup_internship.sql` and run it:

```sql
-- Create simulations
INSERT INTO simulations (title, description, category, difficulty, duration, image, overview, features, skills, rating)
VALUES
  ('E-Commerce Platform Development', 'Build a full-stack e-commerce platform', 'Software Development', 'Advanced', '1-2 months', NULL, 'Create complete e-commerce solution', 'Product Management, Cart, Payments', 'React, Node.js, MongoDB, Stripe', NULL),
  ('Mobile Task Management App', 'Develop a mobile task app', 'Mobile Development', 'Intermediate', '2-3 weeks', NULL, 'Build mobile task management app', 'Task Management, Real-time Sync', 'React Native, Firebase', NULL),
  ('Sales Analytics Dashboard', 'Create analytics dashboard', 'Data Analytics', 'Intermediate', '1-2 weeks', NULL, 'Build analytics dashboard', 'Data Visualization, Metrics', 'Python, Pandas, SQL', NULL),
  ('Redesign Social Media Platform', 'Complete UI/UX redesign', 'Design', 'Advanced', '3-4 weeks', NULL, 'Redesign social platform', 'User Research, Wireframing', 'Figma, Adobe XD', NULL);

-- Create tasks for Simulation 1
INSERT INTO tasks (simulation_id, title, full_title, duration, difficulty, description, what_youll_learn, what_youll_do, material_url)
VALUES
  (1, 'Task One', 'Setup Project Repository', '30-60 mins', 'Beginner', 'Initialize project', 'Git workflow', 'Create repo', NULL),
  (1, 'Task Two', 'Design Database Schema', '1-2 hours', 'Intermediate', 'Design database', 'Database design', 'Create schema', NULL),
  (1, 'Task Three', 'Build Authentication System', '1-2 hours', 'Intermediate', 'Implement auth', 'JWT auth', 'Create auth endpoints', NULL),
  (1, 'Task Four', 'Shopping Cart Functionality', '1-2 hours', 'Intermediate', 'Create cart features', 'State management', 'Implement cart', NULL),
  (1, 'Task Five', 'Integrate Payment Gateway', '2-3 hours', 'Advanced', 'Add payments', 'Payment processing', 'Setup Stripe', NULL);

-- Insert roles for your test users (replace UUIDs with your actual auth user IDs)
-- INSERT INTO user_roles (user_id, role) VALUES ('your-admin-uuid', 'admin');
-- INSERT INTO user_roles (user_id, role) VALUES ('your-student-uuid', 'user');
```

---

**Setup Complete!** Now follow the INTERNSHIP_MODULE_GUIDE.md for step-by-step instructions.

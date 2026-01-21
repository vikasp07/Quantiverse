# 📁 Complete Project Structure - MockInterview (Quantiverse)

## 🏗️ Project Architecture

```
MockInterview/
│
├── 📄 index.html                    # Main HTML entry point
├── 📄 package.json                  # Frontend dependencies & scripts
├── 📄 vite.config.js                # Vite build configuration
├── 📄 eslint.config.js              # ESLint configuration
├── 📄 README.md                     # Project documentation
├── 📄 structure.txt                 # Project structure file
│
├── 📁 backend/                      # Flask Python Backend
│   ├── 📄 app.py                    # Main Flask application (980 lines)
│   ├── 📄 requirements.txt          # Python dependencies
│   ├── 📄 .env                      # Environment variables (secret)
│   ├── 📄 .env.example              # Environment template
│   ├── 📄 internship_api.py         # Internship API routes
│   ├── 📄 resume_parser.py          # PDF resume text extraction
│   ├── 📄 match_gemini.py           # AI skill matching with Gemini
│   ├── 📄 gemini_resume_builder_helper.py # Gemini resume helper
│   ├── 📄 resume_fetcher.py         # Resume fetching utility
│   ├── 📄 sanitizer.py              # Input sanitization
│   ├── 📄 utils.py                  # LaTeX generation utilities
│   ├── 📄 test_enrollment.py        # Enrollment tests
│   ├── 📄 template.tex              # LaTeX resume template
│   ├── 📄 mcdowellcv.cls            # LaTeX CV class file
│   ├── 📄 categories.json           # Category data
│   ├── 📄 enrollments.json          # User enrollments data
│   ├── 📄 internships.json          # Internship listings
│   ├── 📄 simulations.json          # Simulation data
│   ├── 📄 simulation_tasks.json     # Simulation tasks
│   ├── 📄 user_activity.json        # User activity tracking
│   ├── 📁 uploads/                  # Uploaded files storage
│   └── 📁 __pycache__/              # Python cache
│
├── 📁 resume-pdf-server/            # Node.js PDF Generation Service
│   ├── 📄 package.json              # Node dependencies
│   ├── 📄 server.js                 # Express server with Puppeteer
│   ├── 📄 package-lock.json
│   └── 📁 node_modules/
│
├── 📁 public/                       # Static public assets
│   └── 📁 tinymce/                  # TinyMCE rich text editor
│       ├── 📄 tinymce.js
│       ├── 📄 tinymce.min.js
│       ├── 📁 icons/default/
│       ├── 📁 models/dom/
│       ├── 📁 plugins/              # TinyMCE plugins (accordion, code, etc.)
│       ├── 📁 skins/content/
│       ├── 📁 skins/ui/
│       └── 📁 themes/silver/
│
└── 📁 src/                          # React Frontend Source
    ├── 📄 App.jsx                   # Main React app with routing
    ├── 📄 main.jsx                  # React entry point
    ├── 📄 index.css                 # Global CSS styles
    ├── 📄 styles.css                # Additional styles
    ├── 📁 assets/                   # Static assets (images, etc.)
    │
    ├── 📁 pages/                    # Page components
    │   ├── 📄 Index.jsx             # Main landing/dashboard page
    │   └── 📄 PreparationHub.jsx    # Interview preparation hub
    │
    └── 📁 components/               # React components
        │
        ├── 📄 ActionCard.jsx             # Action card component
        ├── 📄 AdminDashboard.jsx         # Admin dashboard
        ├── 📄 ATSChecker.jsx             # ATS resume checker
        ├── 📄 CategoryAutocomplete.jsx   # Category autocomplete
        ├── 📄 Header.jsx                 # Header component
        ├── 📄 InterviewTable.jsx         # Interview table
        ├── 📄 JobReadinessAssessmentForm.jsx
        ├── 📄 Layout.jsx                 # Main layout wrapper
        ├── 📄 MockInterviewDashboard.jsx # Mock interview dashboard
        ├── 📄 Navbar.jsx                 # Navigation bar
        ├── 📄 OnboardingBanner.jsx       # Onboarding banner
        ├── 📄 ProtectedRoute.jsx         # Auth protected route wrapper
        ├── 📄 ScanResults.jsx            # ATS scan results
        ├── 📄 Sidebar.jsx                # Sidebar navigation
        │
        ├── 📁 __tests__/                 # Unit tests
        │   └── 📄 ProtectedRoute.test.jsx
        │
        ├── 📁 admin/                     # Admin components
        │   ├── 📄 AddInternship.jsx      # Add internship form
        │   ├── 📄 AddQuestionBank.jsx    # Add question bank
        │   ├── 📄 Confirmation.jsx       # Confirmation page
        │   └── 📄 SimulationsManager.jsx # Manage simulations
        │
        ├── 📁 Auth/                      # Authentication
        │   ├── 📄 AuthContext.jsx        # Auth context provider
        │   ├── 📄 signin.jsx             # Sign in page
        │   ├── 📄 signup.jsx             # Sign up page
        │   └── 📄 UpdatePassword.jsx     # Password update
        │
        ├── 📁 document_center/           # Document management
        │   └── 📄 DocumentCenter.jsx     # Document center
        │
        ├── 📁 internship/                # Internship module
        │   ├── 📄 Certificate.jsx        # Certificate generator
        │   ├── 📄 HowItWorksSection.jsx  # How it works section
        │   ├── 📄 InternshipCandidates.jsx
        │   ├── 📄 InternshipDashboard.jsx
        │   ├── 📄 InternshipSubmissions.jsx
        │   ├── 📄 ProgressPage.jsx       # Progress tracking
        │   ├── 📄 SImulationCard.jsx     # Simulation card
        │   ├── 📄 SimulationDetail.jsx   # Simulation details
        │   ├── 📄 SimulationTaskPage.jsx # Task page
        │   ├── 📄 SubmissionPreviewModal.jsx
        │   └── 📄 WorkUpload.jsx         # Work upload
        │
        ├── 📁 job_readiness/             # Job readiness assessment
        │   ├── 📄 Feedback.jsx           # Feedback component
        │   ├── 📄 Forms.jsx              # Assessment forms
        │   ├── 📄 JobReadinessAssessment.jsx
        │   └── 📄 JobReadinessGoalSelector.jsx
        │
        ├── 📁 mock/                      # Mock interview
        │   ├── 📄 Feedback.jsx           # Interview feedback
        │   ├── 📄 InterviewReminder.jsx  # Reminders
        │   ├── 📄 MockInterviewForm.jsx  # Interview form
        │   └── 📄 VideoCallContent.jsx   # Video call interface
        │
        ├── 📁 practicing_questions/      # Practice questions
        │   ├── 📄 FilterBar.jsx          # Filter bar
        │   ├── 📄 PracticingQuestions.jsx
        │   └── 📄 QuestionCard.jsx       # Question card
        │
        ├── 📁 preparation_hub/           # Preparation hub
        │   └── 📄 UploadResume.jsx       # Resume upload
        │
        ├── 📁 profile/                   # User profile
        │   └── 📄 UserProfile.jsx        # Profile page
        │
        ├── 📁 resume_builder/            # Resume builder
        │   ├── 📄 forms.jsx              # Resume forms
        │   ├── 📄 LandingPage.jsx        # Builder landing
        │   ├── 📄 ResumeBuilder.jsx      # Main builder
        │   └── 📄 Template.jsx           # Resume template
        │
        ├── 📁 resume_from_scratch/       # Build resume from scratch
        │   └── 📄 ResumeFromScratch.jsx
        │
        ├── 📁 ui/                        # UI components
        │   └── 📄 index.jsx              # UI exports
        │
        └── 📁 utils/                     # Utility functions
            ├── 📄 ActivityTracker.jsx    # Activity tracking
            ├── 📄 simulations.js         # Simulation helpers
            ├── 📄 supabaseClient.js      # Supabase client config
            └── 📄 uploadResume.js        # Resume upload helper
```

---

## 🚀 How to Start This Project

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18+)
- **Python** (v3.8+)
- **npm** or **yarn**
- **pip** (Python package manager)

---

## 📋 Step-by-Step Setup

### 1️⃣ Clone & Navigate to Project

```powershell
cd c:\Users\HOME\Desktop\Quantiverse_Inter\MockInterview
```

### 2️⃣ Setup Frontend (React + Vite)

```powershell
# Install frontend dependencies
npm install
```

Create a `.env.local` file in the root `MockInterview` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3️⃣ Setup Backend (Flask Python)

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate

# Install Python dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GEMINI_API_KEY=your_gemini_api_key
```

### 4️⃣ Setup PDF Server (Node.js + Puppeteer)

```powershell
# Navigate to PDF server folder
cd ..\resume-pdf-server

# Install dependencies
npm install
```

---

## 🏃 Running the Project

You need to run **3 separate terminals** for all services:

### Terminal 1 - Frontend (React + Vite)

```powershell
cd c:\Users\HOME\Desktop\Quantiverse_Inter\MockInterview
npm run dev
```

**Runs on:** `http://localhost:5173`

### Terminal 2 - Backend (Flask API)

```powershell
cd c:\Users\HOME\Desktop\Quantiverse_Inter\MockInterview\backend
.\venv\Scripts\Activate
python app.py
```

**Runs on:** `http://localhost:5000`

### Terminal 3 - PDF Server (Express + Puppeteer)

```powershell
cd c:\Users\HOME\Desktop\Quantiverse_Inter\MockInterview\resume-pdf-server
node server.js
```

**Runs on:** `http://localhost:3001`

---

## 🔧 Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 6, TailwindCSS 4, React Router 7 |
| **Backend** | Flask, Python 3.8+, Flask-CORS |
| **Database/Auth** | Supabase (PostgreSQL + Auth) |
| **AI Integration** | Google Gemini API |
| **PDF Generation** | Puppeteer (Node.js), LaTeX |
| **Rich Text Editor** | TinyMCE 6 |
| **Charts** | Recharts |
| **Icons** | Lucide React, React Icons |

---

## 📦 Dependencies

### Frontend (package.json)

```json
{
  "dependencies": {
    "@headlessui/react": "^2.2.4",
    "@react-pdf/renderer": "^4.3.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/supabase-js": "^2.50.0",
    "@tailwindcss/vite": "^4.1.8",
    "@tinymce/tinymce-react": "^4.3.2",
    "axios": "^1.10.0",
    "html2pdf.js": "^0.10.3",
    "jspdf": "^3.0.1",
    "lucide-react": "^0.513.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.6.3",
    "recharts": "^3.6.0",
    "tailwindcss": "^4.1.8",
    "tinymce": "^6.8.6"
  }
}
```

### Backend (requirements.txt)

```
flask
flask-cors
PyPDF2
google-generativeai
python-dotenv
textblob
supabase
```

### PDF Server (package.json)

```json
{
  "dependencies": {
    "body-parser": "^2.2.0",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "puppeteer": "^24.13.0"
  }
}
```

---

## 📌 Key Features

1. **Authentication** - Supabase-based sign up/sign in with protected routes
2. **Mock Interviews** - Video call mock interview system with AI feedback
3. **ATS Resume Checker** - AI-powered resume scanning and scoring
4. **Resume Builder** - Build resumes with templates and export to PDF
5. **Internship Management** - Browse, apply, and manage internships
6. **Job Readiness Assessment** - Career readiness evaluation and feedback
7. **Practice Questions** - Interview question practice with filtering
8. **Admin Dashboard** - Manage internships, simulations & question banks
9. **Activity Tracking** - User activity monitoring and analytics
10. **PDF Export** - Generate professional PDF resumes with Puppeteer

---

## 📝 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start Vite dev server (port 5173) |
| Build | `npm run build` | Build for production |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Run ESLint checks |

---

## 🔐 Environment Variables

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) |
| `GEMINI_API_KEY` | Google Gemini API key for AI features |

---

## 🗂️ API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-resume` | Upload and parse resume PDF |
| POST | `/match-skills` | Match skills using Gemini AI |
| GET | `/internships` | Get all internships |
| POST | `/internships` | Create new internship |
| GET | `/simulations` | Get all simulations |
| POST | `/enrollments` | Enroll in internship |
| GET | `/user-activity` | Get user activity data |

---

## 🛠️ Troubleshooting

### Common Issues

1. **Module not found errors**
   ```powershell
   npm install
   pip install -r requirements.txt
   ```

2. **Supabase connection failed**
   - Verify `.env.local` and `.env` files exist with correct keys
   - Check Supabase project is active

3. **PDF generation fails**
   - Ensure Puppeteer is installed: `npm install puppeteer`
   - Check Chrome/Chromium is accessible

4. **CORS errors**
   - Backend CORS is configured for `http://localhost:5173`
   - Ensure frontend runs on port 5173

---

## 📞 Support

- **Repository:** https://github.com/vikasp07/Quantiverse
- **Branch:** main

---

*Last updated: January 2026*

from flask import Flask, request, jsonify, send_file, make_response
import uuid
import os
import json
import re
import traceback
from pathlib import Path
from datetime import datetime
from resume_parser import extract_text_from_pdf
from match_gemini import match_skills
from werkzeug.utils import secure_filename 
import secrets
from flask_cors import CORS
from supabase import create_client
from internship_api import internship_bp
# Lazy import utils only when needed to avoid heavy dependencies on startup
# from utils import generate_latex, compile_latex_to_pdf
import io
# from gemini_resume_builder_helper import refine_all_bullets
# from utils import apply_local_spellcheck  # or spellcheck_utils if placed separately


app = Flask(__name__)
# 🔐 Secret key for sessions (required even if you don't use sessions yet)
app.secret_key = secrets.token_hex(16)

# 🔐 Secure session cookie settings
app.config.update(
    SESSION_COOKIE_SECURE=True,       # Only send cookies over HTTPS
    SESSION_COOKIE_HTTPONLY=True,     # JS can’t access cookies
    SESSION_COOKIE_SAMESITE='Lax'     # Avoid CSRF in most common cases
)

# CORS Configuration - Allow frontend to access backend
CORS(app,
     origins=[
         "http://localhost:5173",
         "https://quantiverse-front.onrender.com",
         "https://quantiverse-frontend1.onrender.com"
     ],
     methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True,
     expose_headers=["Content-Type"],
     max_age=3600)

# Security Headers Middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    
    # Content Security Policy (CSP)
    # Restricts what resources can be loaded and from where
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "  # Allow inline scripts for TinyMCE
        "style-src 'self' 'unsafe-inline'; "  # Allow inline styles
        "img-src 'self' data: https:; "  # Allow images from self, data URIs, and HTTPS
        "font-src 'self' data:; "
        "connect-src 'self' http://localhost:5173 https://quantiverse-front.onrender.com https://quantiverse-frontend1.onrender.com https://eplfwexdnkcwqdcqbgqq.supabase.co; "  # API calls
        "frame-ancestors 'none'; "  # Prevent clickjacking
        "base-uri 'self'; "  # Restrict base tag
        "form-action 'self'; "  # Restrict form submissions
    )
    response.headers['Content-Security-Policy'] = csp_policy
    
    # X-Content-Type-Options
    # Prevents MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # X-Frame-Options
    # Prevents clickjacking attacks
    response.headers['X-Frame-Options'] = 'DENY'
    
    # X-XSS-Protection
    # Enables browser's XSS filter (legacy browsers)
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Strict-Transport-Security (HSTS)
    # Forces HTTPS (uncomment for production with HTTPS)
    # response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    # Referrer-Policy
    # Controls how much referrer information is sent
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Permissions-Policy
    # Controls which browser features can be used
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    
    return response

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
print(type(SUPABASE_URL), SUPABASE_URL)
print(type(SUPABASE_ANON_KEY), len(SUPABASE_ANON_KEY or ""))

try:
    # Create two clients:
    # 1. Anon client for reads (respects RLS)
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    print("✓ Supabase anon client created successfully")
    
    # 2. Service role client for writes (bypasses RLS) - only if key is available
    if SUPABASE_SERVICE_ROLE_KEY:
        supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("✓ Supabase admin client created successfully")
    else:
        supabase_admin = supabase  # Fallback to anon client
        print("⚠️  No service role key found, using anon client for admin operations")
    
    print("✓ Supabase clients ready")
except Exception as e:
    print(f"⚠️  Supabase connection error: {str(e)}")
    supabase = None
    supabase_admin = None

# Store both in app config for access in blueprints
app.config['supabase'] = supabase
app.config['supabase_admin'] = supabase_admin

# Register Blueprints
app.register_blueprint(internship_bp)




ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==================== ATS SCANNER - DISABLED ====================
# @app.route('/upload_resume', methods=['POST'])
# def upload_resume():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400
#
#     file = request.files['file']
#     if not allowed_file(file.filename):
#         return jsonify({'error': 'Only PDF files are allowed'}), 400
#     job_description = request.form.get('job_description', 'Software Developer')
#
#     filename = secure_filename(file.filename)
#     filepath = os.path.join(UPLOAD_FOLDER, filename)
#     file.save(filepath)
#
#     resume_text = extract_text_from_pdf(filepath)
#     if not job_description:
#         job_description = "Looking for a frontend developer skilled in React, JavaScript, and UI/UX design."
#     score, matched_skills = match_skills(resume_text, job_description)
#
#     return jsonify({
#         'score': score,
#         'matched_skills': matched_skills
#     })


# ==================== RESUME BUILDER - DISABLED ====================
# @app.route("/compile", methods=["POST"])
# def compile_resume():
#     try:
#         data = request.json
#
#         if data.get("resumeType") == "one":
#             data['projects'] = data['projects'][:4]
#             data['education'] = data['education'][:2]
#
#         data = refine_all_bullets(data)
#         latex = generate_latex(data)
#         pdf = compile_latex_to_pdf(latex)
#         print("[DEBUG] Compiled PDF:", "Success" if pdf else "Failed")
#
#         if pdf:
#             response = make_response(pdf)
#             response.headers.set("Content-Type", "application/pdf")
#             response.headers.set("Content-Disposition", "attachment", filename="resume.pdf")
#             response.headers.set("Access-Control-Allow-Origin", "http://localhost:5173")
#             return response
#         else:
#             return {"error": "LaTeX compilation failed"}, 500
#
#     except Exception as e:
#         print("[ERROR] Exception in /compile:", str(e))
#         return {"error": str(e)}, 500


# ==================== QUIZ ENDPOINTS ====================

# File-based storage for quiz attempts
QUIZ_ATTEMPTS_FILE = Path('quiz_attempts.json')

def load_quiz_attempts():
    """Load quiz attempts from JSON file"""
    if QUIZ_ATTEMPTS_FILE.exists():
        try:
            with open(QUIZ_ATTEMPTS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading quiz attempts: {e}")
            return {}
    return {}

def save_quiz_attempts(attempts):
    """Save quiz attempts to JSON file"""
    try:
        with open(QUIZ_ATTEMPTS_FILE, 'w') as f:
            json.dump(attempts, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving quiz attempts: {e}")
        return False

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """
    Submit a quiz attempt and record the result
    
    Request body:
    {
        "user_id": "uuid",
        "task_id": int,
        "simulation_id": int,
        "quiz_result": {
            "totalScore": int,
            "totalMarks": int,
            "percentage": float,
            "correctCount": int,
            "totalQuestions": int,
            "passed": bool,
            "questionResults": [...],
            "attemptNumber": int,
            "completedAt": "ISO timestamp"
        }
    }
    """
    try:
        data = request.json
        user_id = data.get('user_id')
        task_id = data.get('task_id')
        simulation_id = data.get('simulation_id')
        quiz_result = data.get('quiz_result')
        
        if not all([user_id, task_id, quiz_result]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Load existing attempts
        attempts = load_quiz_attempts()
        
        # Create key for this user+task combination
        attempt_key = f"{user_id}_{task_id}"
        
        if attempt_key not in attempts:
            attempts[attempt_key] = {
                'user_id': user_id,
                'task_id': task_id,
                'simulation_id': simulation_id,
                'attempts': [],
                'best_score': 0,
                'passed': False,
                'first_attempt_at': quiz_result.get('completedAt'),
                'last_attempt_at': quiz_result.get('completedAt')
            }
        
        # Add this attempt
        attempt_record = {
            'attempt_number': quiz_result.get('attemptNumber', len(attempts[attempt_key]['attempts']) + 1),
            'score': quiz_result.get('totalScore', 0),
            'total_marks': quiz_result.get('totalMarks', 0),
            'percentage': quiz_result.get('percentage', 0),
            'passed': quiz_result.get('passed', False),
            'completed_at': quiz_result.get('completedAt'),
            'correct_count': quiz_result.get('correctCount', 0),
            'total_questions': quiz_result.get('totalQuestions', 0)
        }
        attempts[attempt_key]['attempts'].append(attempt_record)
        attempts[attempt_key]['last_attempt_at'] = quiz_result.get('completedAt')
        
        # Update best score and passed status
        if quiz_result.get('percentage', 0) > attempts[attempt_key].get('best_score', 0):
            attempts[attempt_key]['best_score'] = quiz_result.get('percentage', 0)
        
        if quiz_result.get('passed', False):
            attempts[attempt_key]['passed'] = True
        
        # Save attempts
        save_quiz_attempts(attempts)
        
        # Also try to update in Supabase if available
        if supabase:
            try:
                # Try to insert quiz result in Supabase
                supabase_data = {
                    'user_id': user_id,
                    'task_id': task_id,
                    'simulation_id': simulation_id,
                    'score': quiz_result.get('totalScore', 0),
                    'total_marks': quiz_result.get('totalMarks', 0),
                    'percentage': quiz_result.get('percentage', 0),
                    'passed': quiz_result.get('passed', False),
                    'attempt_number': attempt_record['attempt_number'],
                    'completed_at': quiz_result.get('completedAt')
                }
                # This will fail silently if the table doesn't exist
                supabase.table('quiz_attempts').insert(supabase_data).execute()
            except Exception as e:
                print(f"Supabase quiz insert skipped: {e}")
        
        # Create notification for quiz result
        if quiz_result.get('passed', False):
            create_notification(
                user_id=user_id,
                notification_type='quiz_passed',
                title='🎊 Quiz Passed!',
                message=f"Congratulations! You passed the quiz with {quiz_result.get('percentage', 0):.0f}%! Keep up the great work!",
                metadata={
                    'task_id': task_id,
                    'simulation_id': simulation_id,
                    'percentage': quiz_result.get('percentage', 0)
                }
            )
        else:
            create_notification(
                user_id=user_id,
                notification_type='quiz_attempt',
                title='📝 Quiz Completed',
                message=f"You scored {quiz_result.get('percentage', 0):.0f}% on the quiz. You need 70% to pass. Keep practicing!",
                metadata={
                    'task_id': task_id,
                    'simulation_id': simulation_id,
                    'percentage': quiz_result.get('percentage', 0)
                }
            )
        
        # Track submission in user activity (for admin viewing)
        if user_id in user_activity_data:
            if 'submissions' not in user_activity_data[user_id]:
                user_activity_data[user_id]['submissions'] = []
            
            submission_record = {
                'type': 'quiz',
                'task_id': task_id,
                'simulation_id': simulation_id,
                'score': quiz_result.get('totalScore', 0),
                'total_marks': quiz_result.get('totalMarks', 0),
                'percentage': quiz_result.get('percentage', 0),
                'passed': quiz_result.get('passed', False),
                'attempt_number': attempt_record['attempt_number'],
                'timestamp': quiz_result.get('completedAt') or datetime.now().isoformat()
            }
            user_activity_data[user_id]['submissions'].insert(0, submission_record)
            
            # Add to activity history
            add_activity_event(user_id, 'quiz_submission', {
                'task_id': task_id,
                'passed': quiz_result.get('passed', False),
                'percentage': quiz_result.get('percentage', 0)
            })
            
            save_activity_data(user_activity_data)
        
        return jsonify({
            'success': True,
            'message': 'Quiz result recorded',
            'passed': quiz_result.get('passed', False),
            'best_score': attempts[attempt_key]['best_score'],
            'total_attempts': len(attempts[attempt_key]['attempts'])
        }), 200
        
    except Exception as e:
        print(f"Error in submit_quiz: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz/attempts/<user_id>/<int:task_id>', methods=['GET'])
def get_quiz_attempts(user_id, task_id):
    """Get all quiz attempts for a user on a specific task"""
    try:
        attempts = load_quiz_attempts()
        attempt_key = f"{user_id}_{task_id}"
        
        if attempt_key in attempts:
            return jsonify(attempts[attempt_key]), 200
        else:
            return jsonify({
                'user_id': user_id,
                'task_id': task_id,
                'attempts': [],
                'best_score': 0,
                'passed': False
            }), 200
            
    except Exception as e:
        print(f"Error in get_quiz_attempts: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/quiz/status/<user_id>/<simulation_id>', methods=['GET'])
def get_quiz_status(user_id, simulation_id):
    """Get quiz completion status for all tasks in a simulation"""
    try:
        attempts = load_quiz_attempts()
        
        # Filter attempts for this user and simulation
        task_statuses = {}
        for key, attempt_data in attempts.items():
            if attempt_data.get('user_id') == user_id and str(attempt_data.get('simulation_id')) == str(simulation_id):
                task_id = attempt_data.get('task_id')
                task_statuses[task_id] = {
                    'passed': attempt_data.get('passed', False),
                    'best_score': attempt_data.get('best_score', 0),
                    'total_attempts': len(attempt_data.get('attempts', []))
                }
        
        return jsonify({
            'user_id': user_id,
            'simulation_id': simulation_id,
            'task_statuses': task_statuses
        }), 200
        
    except Exception as e:
        print(f"Error in get_quiz_status: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== ENROLLMENT ENDPOINTS ====================

# File-based storage for course enrollments
ENROLLMENTS_FILE = Path('enrollments.json')

def load_enrollments():
    """Load enrollments from JSON file"""
    if ENROLLMENTS_FILE.exists():
        try:
            with open(ENROLLMENTS_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_enrollments(enrollments):
    """Save enrollments to JSON file"""
    with open(ENROLLMENTS_FILE, 'w') as f:
        json.dump(enrollments, f, indent=2)

# Load enrollments on startup
course_enrollments = load_enrollments()

@app.route('/enroll', methods=['POST'])
def enroll_user():
    """Enroll a user in an internship with simulation-specific tasks"""
    try:
        data = request.json
        print(f"[DEBUG] Enrollment request: {data}")
        
        user_id = data.get('user_id')
        user_name = data.get('user_name')
        user_email = data.get('user_email')
        internship_id = data.get('internship_id')
        internship_name = data.get('internship_name')

        # Validate required fields
        if not all([user_id, user_email, internship_id]):
            print("[ERROR] Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if already enrolled
        existing = next(
            (e for e in course_enrollments 
             if e['user_id'] == user_id and e['internship_id'] == str(internship_id)),
            None
        )
        
        if existing:
            return jsonify({'message': 'Already enrolled', 'is_enrolled': True}), 200

        # ✅ Load custom tasks for this internship from simulation_tasks.json
        tasks_for_internship = []
        try:
            sim_tasks_path = Path('simulation_tasks.json')
            if sim_tasks_path.exists():
                with open(sim_tasks_path, 'r') as f:
                    all_sim_tasks = json.load(f)
                
                # Find tasks for this specific simulation
                sim_task_config = next(
                    (st for st in all_sim_tasks if st['simulation_id'] == str(internship_id)),
                    None
                )
                
                if sim_task_config:
                    # Convert task config to enrollment task format
                    tasks_for_internship = [
                        {
                            'task_id': task['task_id'],
                            'title': task['title'],
                            'order': task.get('order', idx + 1),
                            'description': task.get('description', ''),
                            'completed': False
                        }
                        for idx, task in enumerate(sim_task_config['tasks'])
                    ]
                    print(f"[DEBUG] Loaded {len(tasks_for_internship)} tasks for internship {internship_id}")
        except Exception as e:
            print(f"[WARNING] Failed to load custom tasks: {str(e)}")

        # Create enrollment with custom tasks
        enrollment = {
            'user_id': user_id,
            'user_name': user_name or user_email.split('@')[0],
            'user_email': user_email,
            'internship_id': str(internship_id),
            'internship_name': internship_name,
            'enrolled_at': datetime.now().isoformat(),
            'tasks': tasks_for_internship if tasks_for_internship else [
                # Fallback: if no custom tasks found
                {
                    'task_id': 'task_' + str(uuid.uuid4()),
                    'title': 'Complete Internship',
                    'order': 1,
                    'completed': False
                }
            ]
        }

        
        course_enrollments.append(enrollment)
        save_enrollments(course_enrollments)
        
        # Create notification for successful enrollment
        create_notification(
            user_id=user_id,
            notification_type='enrollment',
            title='🎉 Successfully Enrolled!',
            message=f"You've been enrolled in {internship_name}. Start completing tasks to earn your certificate!",
            metadata={
                'internship_id': str(internship_id),
                'internship_name': internship_name,
                'tasks_count': len(enrollment['tasks'])
            }
        )
        
        # Track enrollment in user activity (for admin viewing)
        if user_id in user_activity_data:
            add_activity_event(user_id, 'enrollment', {
                'internship_id': str(internship_id),
                'internship_name': internship_name
            })
        
        return jsonify({
            'message': 'Enrollment successful',
            'enrollment': enrollment
        }), 201

    except Exception as e:
        print(f"[ERROR] Enrollment failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/enrollment-status', methods=['GET'])
def check_enrollment_status():
    """Check if a user is enrolled in an internship"""
    try:
        user_id = request.args.get('user_id')
        internship_id = request.args.get('internship_id')
        
        print(f"[DEBUG] Checking enrollment status: user_id={user_id}, internship_id={internship_id}")

        if not user_id or not internship_id:
            return jsonify({'error': 'Missing user_id or internship_id'}), 400

        # Check enrollment
        is_enrolled = any(
            e['user_id'] == user_id and e['internship_id'] == str(internship_id)
            for e in course_enrollments
        )
        
        print(f"[DEBUG] Is enrolled: {is_enrolled}, Total enrollments: {len(course_enrollments)}")

        return jsonify({'is_enrolled': is_enrolled}), 200

    except Exception as e:
        print(f"[ERROR] Status check failed: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ===== INTERNSHIP ROUTES HANDLED BY internship_bp blueprint (see internship_api.py) =====
# The blueprint handles:
# - POST /admin/internships - Create new simulation
# - PUT /admin/internships/<id> - Update simulation


@app.route('/admin/internships/<internship_id>/candidates', methods=['GET'])
def get_internship_candidates(internship_id):
    """Get all candidates enrolled in a specific internship with real-time progress from Supabase"""
    try:
        print(f"[DEBUG] Fetching candidates for internship_id: {internship_id}")
        print(f"[DEBUG] Total enrollments in system: {len(course_enrollments)}")
        
        # Filter enrollments for this internship
        candidates = [
            e for e in course_enrollments 
            if e['internship_id'] == str(internship_id)
        ]
        
        print(f"[DEBUG] Found {len(candidates)} candidates for this internship")
        
        # Sort by enrollment date (latest first)
        candidates.sort(key=lambda x: x['enrolled_at'], reverse=True)
        
        # Get total number of tasks for this simulation from Supabase tasks table
        total_tasks_for_sim = 0
        if supabase:
            try:
                tasks_response = supabase.table('tasks').select(
                    'id'
                ).eq('simulation_id', str(internship_id)).execute()
                
                if tasks_response.data:
                    total_tasks_for_sim = len(tasks_response.data)
                    print(f"[DEBUG] Found {total_tasks_for_sim} total tasks for this simulation in Supabase")
            except Exception as e:
                print(f"[WARNING] Failed to get total tasks count: {str(e)}")
        
        # Calculate progress for each candidate from Supabase
        for e in candidates:
            user_id = e.get('user_id')
            tasks = e.get('tasks', [])
            
            # Use Supabase total tasks count if available, else use local count
            total_tasks = total_tasks_for_sim if total_tasks_for_sim > 0 else len(tasks)
            
            # Try to fetch real completion status from Supabase
            completed_tasks = 0
            if supabase and user_id:
                try:
                    # Query Supabase for completed tasks by this user in this simulation
                    response = supabase.table('user_task_progress').select(
                        'task_id, status'
                    ).eq('user_id', user_id).eq('simulation_id', str(internship_id)).execute()
                    
                    if response.data:
                        # Count only COMPLETED tasks from Supabase
                        completed_tasks = len([
                            row for row in response.data 
                            if row.get('status') == 'completed'
                        ])
                        
                        print(f"[DEBUG] {e.get('user_name')}: {completed_tasks}/{total_tasks} completed (from Supabase)")
                    else:
                        # No data in Supabase, use local JSON status
                        completed_tasks = len([t for t in tasks if t.get('completed') is True])
                        print(f"[DEBUG] {e.get('user_name')}: No Supabase data, using local JSON - {completed_tasks}/{total_tasks}")
                        
                except Exception as supabase_error:
                    print(f"[WARNING] Supabase query failed for user {user_id}: {str(supabase_error)}")
                    # Fallback to local JSON
                    completed_tasks = len([t for t in tasks if t.get('completed') is True])
            else:
                # Fallback to local JSON if no Supabase or user_id
                completed_tasks = len([t for t in tasks if t.get('completed') is True])
            
            e['total_tasks'] = total_tasks
            e['completed_tasks'] = completed_tasks
            e['progress'] = 0 if total_tasks == 0 else round(
                (completed_tasks / total_tasks) * 100
            )

        
        # Get internship name from first enrollment or default
        internship_name = candidates[0]['internship_name'] if candidates else 'Internship'
         
        
        return jsonify({
            'internship_id': internship_id,
            'internship_name': internship_name,
            'candidates': candidates,
            'total_count': len(candidates)
        }), 200
    

    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to fetch candidates: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
    
@app.route('/enrollments/<internship_id>/<user_id>/tasks/<task_id>', methods=['PATCH'])
def update_task_status(internship_id, user_id, task_id):
    try:
        updated = False

        for e in course_enrollments:
            if (
                e['internship_id'] == internship_id and
                e['user_id'] == user_id
            ):
                for task in e.get('tasks', []):
                    if task['task_id'] == task_id:
                        task['completed'] = True
                        updated = True

        if updated:
            save_enrollments(course_enrollments)  # Save updated enrollments to JSON
            return jsonify({'message': 'Task marked as completed'}), 200

        return jsonify({'error': 'Task not found'}), 404

    except Exception as ex:
        return jsonify({'error': str(ex)}), 500



@app.route('/health', methods=['GET'])
def health_check():
    """Check backend health and Supabase connection"""
    try:
        is_supabase_ok = False
        if supabase:
            try:
                # Try a simple health check
                supabase.table('simulations').select('*').limit(1).execute()
                is_supabase_ok = True
            except Exception as db_err:
                print(f"Supabase health check failed: {str(db_err)}")
        
        return jsonify({
            'status': 'ok',
            'supabase_connected': is_supabase_ok,
            'message': 'Backend is running'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# Category Management Endpoints
CATEGORIES_FILE = 'categories.json'

def load_categories():
    """Load categories from JSON file"""
    try:
        if os.path.exists(CATEGORIES_FILE):
            with open(CATEGORIES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading categories: {e}")
        return []

def save_categories(categories):
    """Save categories to JSON file"""
    try:
        with open(CATEGORIES_FILE, 'w', encoding='utf-8') as f:
            json.dump(categories, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving categories: {e}")
        return False

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    categories = load_categories()
    return jsonify({'categories': categories}), 200

@app.route('/api/categories', methods=['POST'])
def add_category():
    """Add a new category with validation"""
    try:
        data = request.get_json()
        category = data.get('category', '').strip()
        
        # Validation 1: Required field
        if not category:
            return jsonify({'error': 'Category cannot be empty'}), 400
        
        # Validation 2: Minimum length
        if len(category) < 3:
            return jsonify({'error': 'Category must be at least 3 characters'}), 400
        
        # Validation 3: Maximum length
        if len(category) > 50:
            return jsonify({'error': 'Category must not exceed 50 characters'}), 400
        
        # Validation 4: Character restrictions (prevent XSS)
        # Only allow alphanumeric, spaces, and safe special chars
        if not re.match(r'^[a-zA-Z0-9\s\-&/().,]+$', category):
            return jsonify({'error': 'Category contains invalid characters. Only letters, numbers, spaces, and - & / ( ) . , are allowed'}), 400
        
        # Validation 5: Sanitize HTML (defense in depth)
        # Remove any HTML tags that might have slipped through
        category = re.sub(r'<[^>]*>', '', category).strip()
        
        if not category:
            return jsonify({'error': 'Category is empty after sanitization'}), 400
        
        # Load existing categories
        categories = load_categories()
        
        # Validation 6: Check for duplicates (case-insensitive)
        category_lower = category.lower()
        if any(cat.lower() == category_lower for cat in categories):
            return jsonify({'error': 'Category already exists', 'category': category}), 409
        
        # All validations passed - save category
        categories.append(category)
        if save_categories(categories):
            return jsonify({'message': 'Category added successfully', 'category': category}), 201
        else:
            return jsonify({'error': 'Failed to save category'}), 500
    
    except Exception as e:
        print(f"Error in add_category: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/categories/search', methods=['GET'])
def search_categories():
    """Search categories by prefix with validation"""
    try:
        query = request.args.get('q', '').strip()
        
        # Return empty if no query
        if not query:
            return jsonify({'categories': []}), 200
        
        # Validation 1: Maximum query length (prevent abuse)
        if len(query) > 50:
            return jsonify({'error': 'Search query too long'}), 400
        
        # Validation 2: Sanitize query (prevent injection)
        query = re.sub(r'<[^>]*>', '', query).strip()
        query_lower = query.lower()
        
        # Load categories
        categories = load_categories()
        
        # Filter categories that start with the query (case-insensitive)
        matching_categories = [
            cat for cat in categories 
            if cat.lower().startswith(query_lower)
        ]
        
        # Limit results to prevent large responses
        MAX_RESULTS = 20
        matching_categories = matching_categories[:MAX_RESULTS]
        
        return jsonify({'categories': matching_categories}), 200
    
    except Exception as e:
        print(f"Error in search_categories: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


# ===== USER PROFILE API ENDPOINTS =====

@app.route('/admin/user/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """
    Get user profile with all their enrollments and statistics.
    Used by admin to view student profiles from enrolled candidates list.
    """
    try:
        user_data = None
        enrollments_data = []
        
        # Try to get user info from enrollments first
        try:
            with open('enrollments.json', 'r') as f:
                all_enrollments = json.load(f)
        except FileNotFoundError:
            all_enrollments = []
        except json.JSONDecodeError:
            all_enrollments = []
        
        # Find all enrollments for this user
        for enrollment in all_enrollments:
            if enrollment.get('user_id') == user_id:
                # Use data directly from enrollment (already has all needed fields)
                internship_name = enrollment.get('internship_name', 'Unknown Internship')
                total_tasks = enrollment.get('total_tasks', 0)
                
                # Handle completed_tasks - could be a number or array
                completed_tasks_data = enrollment.get('completed_tasks', 0)
                if isinstance(completed_tasks_data, list):
                    completed_tasks = len(completed_tasks_data)
                else:
                    completed_tasks = int(completed_tasks_data) if completed_tasks_data else 0
                
                # Use progress from enrollment or calculate it
                progress = enrollment.get('progress', 0)
                if total_tasks > 0 and progress == 0:
                    progress = round((completed_tasks / total_tasks * 100))
                
                enrollments_data.append({
                    'internship_id': enrollment.get('internship_id'),
                    'internship_name': internship_name,
                    'enrolled_at': enrollment.get('enrolled_at'),
                    'completed_tasks': completed_tasks,
                    'total_tasks': total_tasks,
                    'progress': progress
                })
                
                # Extract user info from first matching enrollment
                if not user_data:
                    user_data = {
                        'id': user_id,
                        'user_name': enrollment.get('user_name', 'Unknown User'),
                        'user_email': enrollment.get('user_email', 'No email'),
                        'email': enrollment.get('user_email', 'No email'),
                        'display_name': enrollment.get('user_name', 'Unknown User'),
                        'created_at': enrollment.get('enrolled_at')
                    }
        
        # If no user data found, return basic info
        if not user_data:
            user_data = {
                'id': user_id,
                'user_name': 'Unknown User',
                'user_email': 'No email available',
                'display_name': 'Unknown User'
            }
        
        return jsonify({
            'user': user_data,
            'enrollments': enrollments_data
        }), 200
        
    except Exception as e:
        print(f"Error in get_user_profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/admin/user/<user_id>/enrollments', methods=['GET'])
def get_user_enrollments(user_id):
    """
    Get all enrollments for a specific user.
    """
    try:
        enrollments_data = []
        
        try:
            with open('enrollments.json', 'r') as f:
                all_enrollments = json.load(f)
        except FileNotFoundError:
            all_enrollments = []
        except json.JSONDecodeError:
            all_enrollments = []
        
        for enrollment in all_enrollments:
            if enrollment.get('user_id') == user_id:
                # Use data directly from enrollment
                internship_name = enrollment.get('internship_name', 'Unknown Internship')
                total_tasks = enrollment.get('total_tasks', 0)
                
                # Handle completed_tasks - could be a number or array
                completed_tasks_data = enrollment.get('completed_tasks', 0)
                if isinstance(completed_tasks_data, list):
                    completed_tasks = len(completed_tasks_data)
                else:
                    completed_tasks = int(completed_tasks_data) if completed_tasks_data else 0
                
                # Use progress from enrollment or calculate it
                progress = enrollment.get('progress', 0)
                if total_tasks > 0 and progress == 0:
                    progress = round((completed_tasks / total_tasks * 100))
                
                enrollments_data.append({
                    'internship_id': enrollment.get('internship_id'),
                    'internship_name': internship_name,
                    'enrolled_at': enrollment.get('enrolled_at'),
                    'completed_tasks': completed_tasks,
                    'total_tasks': total_tasks,
                    'progress': progress
                })
        
        return jsonify({'enrollments': enrollments_data}), 200
        
    except Exception as e:
        print(f"Error in get_user_enrollments: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ==================== ACTIVITY TRACKING ENDPOINTS ====================

# File-based storage for user activity
ACTIVITY_FILE = Path('user_activity.json')

def load_activity_data():
    """Load activity data from JSON file"""
    if ACTIVITY_FILE.exists():
        try:
            with open(ACTIVITY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading activity data: {e}")
            return {}
    return {}

def save_activity_data(data):
    """Save activity data to JSON file"""
    try:
        with open(ACTIVITY_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving activity data: {e}")

# Load activity data on startup
user_activity_data = load_activity_data()

def add_activity_event(user_id, event_type, details=None):
    """Helper function to add an activity event to a user's history"""
    if user_id not in user_activity_data:
        return
    
    event = {
        'event_type': event_type,
        'timestamp': datetime.now().isoformat(),
        'details': details or {}
    }
    
    if 'activity_history' not in user_activity_data[user_id]:
        user_activity_data[user_id]['activity_history'] = []
    
    # Add to beginning (newest first)
    user_activity_data[user_id]['activity_history'].insert(0, event)
    
    # Keep only last 500 events per user
    user_activity_data[user_id]['activity_history'] = user_activity_data[user_id]['activity_history'][:500]
    
    save_activity_data(user_activity_data)

@app.route('/activity/track', methods=['POST', 'OPTIONS'])
def track_activity():
    """Track user activity events"""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.json
        user_id = data.get('user_id')
        event_type = data.get('event_type')
        timestamp = data.get('timestamp') or datetime.now().isoformat()
        session_id = data.get('session_id')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400
        
        # Initialize user activity record if not exists
        if user_id not in user_activity_data:
            user_activity_data[user_id] = {
                'user_id': user_id,
                'user_email': data.get('user_email'),
                'user_name': data.get('user_name'),
                'first_seen': timestamp,
                'last_seen': timestamp,
                'total_session_time': 0,
                'total_active_time': 0,
                'sessions': [],
                'page_visits': [],
                'current_session': None,
                'activity_history': [],
                'submissions': []
            }
        
        user_data = user_activity_data[user_id]
        user_data['last_seen'] = timestamp
        
        # Update user info if provided
        if data.get('user_email'):
            user_data['user_email'] = data.get('user_email')
        if data.get('user_name'):
            user_data['user_name'] = data.get('user_name')
        
        if event_type == 'session_start':
            # Start a new session
            session_data = {
                'session_id': session_id or data.get('session_id') or str(uuid.uuid4()),
                'started_at': timestamp,
                'ended_at': None,
                'duration_seconds': 0,
                'active_time_seconds': 0,
                'pages_visited': [],
                'is_active': True,
                'user_agent': data.get('user_agent'),
                'screen_resolution': data.get('screen_resolution'),
                'timezone': data.get('timezone')
            }
            user_data['current_session'] = session_data
            
            # Add to activity history
            add_activity_event(user_id, 'session_start', {'session_id': session_data['session_id']})
            
        elif event_type == 'heartbeat':
            # Update current session duration
            if user_data.get('current_session'):
                session_duration = data.get('session_duration', 0)
                active_time = data.get('active_time', 0)
                user_data['current_session']['duration_seconds'] = session_duration
                user_data['current_session']['active_time_seconds'] = active_time
                user_data['current_session']['last_heartbeat'] = timestamp
                user_data['current_session']['current_page'] = data.get('current_page')
                user_data['current_session']['is_active'] = True
                
        elif event_type == 'user_idle':
            # User became idle
            if user_data.get('current_session'):
                user_data['current_session']['is_active'] = False
                user_data['current_session']['idle_started_at'] = data.get('idle_started_at')
                user_data['current_session']['duration_seconds'] = data.get('session_duration', 0)
                user_data['current_session']['active_time_seconds'] = data.get('active_time', 0)
                
        elif event_type == 'user_returned':
            # User returned from idle/tab switch
            if user_data.get('current_session'):
                user_data['current_session']['is_active'] = True
                user_data['current_session']['duration_seconds'] = data.get('session_duration', 0)
                
        elif event_type == 'activity_resume':
            # User resumed activity after being idle
            if user_data.get('current_session'):
                user_data['current_session']['is_active'] = True
                user_data['current_session']['resumed_at'] = data.get('resumed_at')
                
        elif event_type == 'session_end':
            # End current session
            if user_data.get('current_session'):
                session = user_data['current_session']
                session['ended_at'] = timestamp
                session['duration_seconds'] = data.get('session_duration', 0)
                session['active_time_seconds'] = data.get('active_time', 0)
                session['is_active'] = False
                session['ended_reason'] = data.get('ended_reason', 'unknown')
                user_data['sessions'].append(session)
                user_data['total_session_time'] += session['duration_seconds']
                user_data['total_active_time'] += session.get('active_time_seconds', 0)
                user_data['current_session'] = None
                
                # Add to activity history
                add_activity_event(user_id, 'session_end', {
                    'session_id': session['session_id'],
                    'duration_seconds': session['duration_seconds'],
                    'active_time_seconds': session.get('active_time_seconds', 0),
                    'ended_reason': session.get('ended_reason')
                })
                
        elif event_type == 'page_view':
            # Track page view
            page_visit = {
                'page_path': data.get('page_path'),
                'page_title': data.get('page_title'),
                'visited_at': timestamp,
                'previous_page': data.get('previous_page'),
                'session_id': session_id
            }
            if user_data.get('current_session'):
                user_data['current_session']['pages_visited'].append(page_visit)
                
        elif event_type == 'visibility_change':
            # Track when user switches tabs/minimizes
            if user_data.get('current_session'):
                user_data['current_session']['last_visibility_state'] = data.get('visibility_state')
                user_data['current_session']['duration_seconds'] = data.get('session_duration', 0)
                if data.get('visibility_state') == 'hidden':
                    user_data['current_session']['hidden_at'] = timestamp
                else:
                    user_data['current_session']['visible_at'] = timestamp
        
        save_activity_data(user_activity_data)
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"Error tracking activity: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/activity/page-duration', methods=['POST', 'OPTIONS'])
def track_page_duration():
    """Track duration spent on a specific page"""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.json
        user_id = data.get('user_id')
        page_path = data.get('page_path')
        duration_seconds = data.get('duration_seconds', 0)
        started_at = data.get('started_at')
        ended_at = data.get('ended_at')
        
        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400
        
        if user_id not in user_activity_data:
            user_activity_data[user_id] = {
                'user_id': user_id,
                'page_visits': [],
                'sessions': [],
                'total_session_time': 0
            }
        
        # Add page visit with duration
        page_visit = {
            'page_path': page_path,
            'duration_seconds': duration_seconds,
            'started_at': started_at,
            'ended_at': ended_at
        }
        
        user_activity_data[user_id]['page_visits'].append(page_visit)
        save_activity_data(user_activity_data)
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"Error tracking page duration: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/activity/session-end', methods=['POST', 'OPTIONS'])
def handle_session_end():
    """Handle session end via sendBeacon"""
    if request.method == 'OPTIONS':
        return '', 200
    try:
        # sendBeacon sends data as text/plain
        data = request.get_json(force=True) if request.is_json else json.loads(request.data.decode('utf-8'))
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'status': 'ok'}), 200
        
        # Initialize user data if not exists
        if user_id not in user_activity_data:
            user_activity_data[user_id] = {
                'user_id': user_id,
                'user_email': data.get('user_email'),
                'user_name': data.get('user_name'),
                'first_seen': data.get('timestamp'),
                'last_seen': data.get('timestamp'),
                'total_session_time': 0,
                'total_active_time': 0,
                'sessions': [],
                'page_visits': [],
                'current_session': None,
                'activity_history': [],
                'submissions': []
            }
        
        user_data = user_activity_data[user_id]
        user_data['last_seen'] = data.get('timestamp')
        
        # Update user info if provided
        if data.get('user_email'):
            user_data['user_email'] = data.get('user_email')
        if data.get('user_name'):
            user_data['user_name'] = data.get('user_name')
        
        # End current session
        if user_data.get('current_session'):
            session = user_data['current_session']
            session['ended_at'] = data.get('timestamp')
            session['duration_seconds'] = data.get('session_duration', 0)
            session['active_time_seconds'] = data.get('active_time', 0)
            session['ended_reason'] = data.get('ended_reason', 'page_unload')
            session['is_active'] = False
            user_data['sessions'].append(session)
            user_data['total_session_time'] += session['duration_seconds']
            user_data['total_active_time'] += session.get('active_time_seconds', 0)
            user_data['current_session'] = None
            
            # Add to activity history
            add_activity_event(user_id, 'session_end', {
                'session_id': session.get('session_id'),
                'duration_seconds': session['duration_seconds'],
                'active_time_seconds': session.get('active_time_seconds', 0),
                'ended_reason': session.get('ended_reason')
            })
        
        # Track last page duration
        if data.get('last_page') and data.get('last_page_duration'):
            page_visit = {
                'page_path': data.get('last_page'),
                'duration_seconds': data.get('last_page_duration'),
                'ended_at': data.get('timestamp'),
                'session_id': data.get('session_id')
            }
            user_data['page_visits'].append(page_visit)
        
        user_data['last_seen'] = data.get('timestamp')
        save_activity_data(user_activity_data)
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"Error handling session end: {e}")
        return jsonify({'status': 'ok'}), 200


@app.route('/admin/user/<user_id>/activity', methods=['GET'])
def get_user_activity(user_id):
    """Get user activity data for admin view"""
    try:
        activity = user_activity_data.get(user_id, {})
        
        # Calculate aggregated stats
        total_sessions = len(activity.get('sessions', []))
        total_time = activity.get('total_session_time', 0)
        total_active_time = activity.get('total_active_time', 0)
        
        # Add current session time if active
        if activity.get('current_session'):
            current_duration = activity['current_session'].get('duration_seconds', 0)
            current_active_time = activity['current_session'].get('active_time_seconds', 0)
            total_time += current_duration
            total_active_time += current_active_time
        
        # Group page visits by path and calculate total time per page
        page_time_map = {}
        for visit in activity.get('page_visits', []):
            path = visit.get('page_path', 'Unknown')
            duration = visit.get('duration_seconds', 0)
            if path in page_time_map:
                page_time_map[path]['total_seconds'] += duration
                page_time_map[path]['visit_count'] += 1
            else:
                page_time_map[path] = {
                    'page_path': path,
                    'total_seconds': duration,
                    'visit_count': 1
                }
        
        # Also include pages from sessions
        for session in activity.get('sessions', []):
            for page in session.get('pages_visited', []):
                path = page.get('page_path', 'Unknown')
                if path not in page_time_map:
                    page_time_map[path] = {
                        'page_path': path,
                        'total_seconds': 0,
                        'visit_count': 0
                    }
                page_time_map[path]['visit_count'] += 1
        
        page_analytics = list(page_time_map.values())
        page_analytics.sort(key=lambda x: x['total_seconds'], reverse=True)
        
        # Get recent sessions (last 20)
        recent_sessions = activity.get('sessions', [])[-20:]
        recent_sessions.reverse()
        
        # Get activity history (submissions, quiz attempts, etc.)
        activity_history = activity.get('activity_history', [])[:100]
        
        # Get submissions
        submissions = activity.get('submissions', [])
        
        # Check if user is currently online (session active or heartbeat within last 2 minutes)
        is_currently_active = False
        current_session_duration = 0
        if activity.get('current_session'):
            is_currently_active = activity['current_session'].get('is_active', False)
            current_session_duration = activity['current_session'].get('duration_seconds', 0)
            
            # Check last heartbeat time
            last_heartbeat = activity['current_session'].get('last_heartbeat')
            if last_heartbeat:
                try:
                    heartbeat_time = datetime.fromisoformat(last_heartbeat.replace('Z', '+00:00'))
                    now = datetime.now(heartbeat_time.tzinfo) if heartbeat_time.tzinfo else datetime.now()
                    time_since_heartbeat = (now - heartbeat_time).total_seconds()
                    is_currently_active = time_since_heartbeat < 120  # 2 minutes
                except:
                    pass
        
        return jsonify({
            'user_id': user_id,
            'user_email': activity.get('user_email'),
            'user_name': activity.get('user_name'),
            'first_seen': activity.get('first_seen'),
            'last_seen': activity.get('last_seen'),
            'total_sessions': total_sessions,
            'total_time_seconds': total_time,
            'total_active_time_seconds': total_active_time,
            'is_currently_active': is_currently_active,
            'current_session_duration': current_session_duration,
            'current_page': activity.get('current_session', {}).get('current_page') if activity.get('current_session') else None,
            'page_analytics': page_analytics[:15],  # Top 15 pages
            'recent_sessions': recent_sessions,
            'activity_history': activity_history,
            'submissions': submissions
        }), 200
        
    except Exception as e:
        print(f"Error getting user activity: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/admin/all-users/activity', methods=['GET'])
def get_all_users_activity():
    """Get activity summary for all users - Admin only"""
    try:
        users_summary = []
        
        for user_id, activity in user_activity_data.items():
            # Calculate total time
            total_time = activity.get('total_session_time', 0)
            total_active_time = activity.get('total_active_time', 0)
            
            if activity.get('current_session'):
                total_time += activity['current_session'].get('duration_seconds', 0)
                total_active_time += activity['current_session'].get('active_time_seconds', 0)
            
            # Count submissions
            submissions_count = len(activity.get('submissions', []))
            
            # Check if user is currently online
            is_currently_active = False
            if activity.get('current_session'):
                is_currently_active = activity['current_session'].get('is_active', False)
                
                # Check last heartbeat time
                last_heartbeat = activity['current_session'].get('last_heartbeat')
                if last_heartbeat:
                    try:
                        heartbeat_time = datetime.fromisoformat(last_heartbeat.replace('Z', '+00:00'))
                        now = datetime.now(heartbeat_time.tzinfo) if heartbeat_time.tzinfo else datetime.now()
                        time_since_heartbeat = (now - heartbeat_time).total_seconds()
                        is_currently_active = time_since_heartbeat < 120  # 2 minutes
                    except:
                        pass
            
            users_summary.append({
                'user_id': user_id,
                'user_email': activity.get('user_email', 'Unknown'),
                'user_name': activity.get('user_name', 'Unknown'),
                'first_seen': activity.get('first_seen'),
                'last_seen': activity.get('last_seen'),
                'total_sessions': len(activity.get('sessions', [])),
                'total_time_seconds': total_time,
                'total_active_time_seconds': total_active_time,
                'is_currently_active': is_currently_active,
                'current_page': activity.get('current_session', {}).get('current_page') if activity.get('current_session') else None,
                'submissions_count': submissions_count
            })
        
        # Sort by last_seen (most recent first)
        users_summary.sort(key=lambda x: x.get('last_seen') or '', reverse=True)
        
        # Calculate overall stats
        total_users = len(users_summary)
        active_users = sum(1 for u in users_summary if u['is_currently_active'])
        total_time_all = sum(u['total_time_seconds'] for u in users_summary)
        
        return jsonify({
            'users': users_summary,
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'total_time_all_users': total_time_all
            }
        }), 200
        
    except Exception as e:
        print(f"Error getting all users activity: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/admin/activity/submissions', methods=['GET'])
def get_all_submissions():
    """Get all submission history across all users - Admin only"""
    try:
        all_submissions = []
        
        for user_id, activity in user_activity_data.items():
            user_submissions = activity.get('submissions', [])
            for submission in user_submissions:
                all_submissions.append({
                    **submission,
                    'user_id': user_id,
                    'user_email': activity.get('user_email'),
                    'user_name': activity.get('user_name')
                })
        
        # Sort by timestamp (most recent first)
        all_submissions.sort(key=lambda x: x.get('timestamp') or '', reverse=True)
        
        return jsonify({
            'submissions': all_submissions[:200],  # Last 200 submissions
            'total': len(all_submissions)
        }), 200
        
    except Exception as e:
        print(f"Error getting all submissions: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== NOTIFICATIONS API ====================

# Notifications JSON file path
NOTIFICATIONS_FILE = Path(__file__).parent / 'notifications.json'

def load_notifications():
    """Load notifications from JSON file"""
    if NOTIFICATIONS_FILE.exists():
        try:
            with open(NOTIFICATIONS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading notifications: {e}")
            return {}
    return {}

def save_notifications(notifications):
    """Save notifications to JSON file"""
    try:
        with open(NOTIFICATIONS_FILE, 'w') as f:
            json.dump(notifications, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving notifications: {e}")
        return False

def create_notification(user_id, notification_type, title, message, metadata=None):
    """Create a new notification for a user"""
    notifications = load_notifications()
    
    if user_id not in notifications:
        notifications[user_id] = []
    
    notification = {
        'id': str(uuid.uuid4()),
        'type': notification_type,  # 'enrollment', 'task_completion', 'quiz_result', 'badge', 'announcement', etc.
        'title': title,
        'message': message,
        'metadata': metadata or {},
        'read': False,
        'created_at': datetime.now().isoformat()
    }
    
    # Add to beginning of list (newest first)
    notifications[user_id].insert(0, notification)
    
    # Keep only last 100 notifications per user
    notifications[user_id] = notifications[user_id][:100]
    
    save_notifications(notifications)
    return notification


@app.route('/api/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    """Get all notifications for a user"""
    try:
        notifications = load_notifications()
        user_notifications = notifications.get(user_id, [])
        
        # Calculate unread count
        unread_count = sum(1 for n in user_notifications if not n.get('read', False))
        
        return jsonify({
            'notifications': user_notifications,
            'unread_count': unread_count,
            'total': len(user_notifications)
        }), 200
        
    except Exception as e:
        print(f"Error getting notifications: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/notifications/<user_id>/mark-read', methods=['POST'])
def mark_notifications_read(user_id):
    """Mark specific notifications as read"""
    try:
        data = request.json
        notification_ids = data.get('notification_ids', [])
        mark_all = data.get('mark_all', False)
        
        notifications = load_notifications()
        user_notifications = notifications.get(user_id, [])
        
        for notification in user_notifications:
            if mark_all or notification.get('id') in notification_ids:
                notification['read'] = True
        
        notifications[user_id] = user_notifications
        save_notifications(notifications)
        
        return jsonify({'status': 'success', 'message': 'Notifications marked as read'}), 200
        
    except Exception as e:
        print(f"Error marking notifications as read: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/notifications/<user_id>/clear', methods=['DELETE'])
def clear_notifications(user_id):
    """Clear all notifications for a user"""
    try:
        notifications = load_notifications()
        notifications[user_id] = []
        save_notifications(notifications)
        
        return jsonify({'status': 'success', 'message': 'All notifications cleared'}), 200
        
    except Exception as e:
        print(f"Error clearing notifications: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/notifications/<user_id>/delete/<notification_id>', methods=['DELETE'])
def delete_notification(user_id, notification_id):
    """Delete a specific notification"""
    try:
        notifications = load_notifications()
        user_notifications = notifications.get(user_id, [])
        
        notifications[user_id] = [n for n in user_notifications if n.get('id') != notification_id]
        save_notifications(notifications)
        
        return jsonify({'status': 'success', 'message': 'Notification deleted'}), 200
        
    except Exception as e:
        print(f"Error deleting notification: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return '''
    <h2>Welcome to the ATS Backend</h2>
    <p>This is the backend server. Use POST /upload_resume to upload resumes.</p>
    '''

if __name__ == '__main__':
    app.run(port=5000, debug=False, use_reloader=False)

from flask import Flask, request, jsonify, send_file, make_response
import os
import json
from pathlib import Path
from datetime import datetime
from resume_parser import extract_text_from_pdf
from match_gemini import match_skills
from werkzeug.utils import secure_filename 
import secrets
from flask_cors import CORS
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

# CORS(app, supports_credentials=True, origins="*")
# CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not allowed_file(file.filename):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    job_description = request.form.get('job_description', 'Software Developer')

    filename = secure_filename(file.filename)  # ✅ this sanitizes the name
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    resume_text = extract_text_from_pdf(filepath)
    # If no job description is passed from frontend, use a default for now
    if not job_description:
        job_description = "Looking for a frontend developer skilled in React, JavaScript, and UI/UX design."
    score, matched_skills = match_skills(resume_text, job_description)

    return jsonify({
        # 'resume_text': resume_text,
        'score': score,
        'matched_skills': matched_skills
    })


@app.route("/compile", methods=["POST"])
def compile_resume():
    try:
        data = request.json

        # ✅ Limit project and education count
        if data.get("resumeType") == "one":
            data['projects'] = data['projects'][:4]
            data['education'] = data['education'][:2]

        # ✅ Apply local spell check (offline, fast)
        # data = apply_local_spellcheck(data)

        data = refine_all_bullets(data)
        
        latex = generate_latex(data)

        pdf = compile_latex_to_pdf(latex)
        print("[DEBUG] Compiled PDF:", "Success" if pdf else "Failed")

        if pdf:
            response = make_response(pdf)
            response.headers.set("Content-Type", "application/pdf")
            response.headers.set("Content-Disposition", "attachment", filename="resume.pdf")
            response.headers.set("Access-Control-Allow-Origin", "http://localhost:5173")
            # response.headers.set("Access-Control-Allow-Headers", "Content-Type")
            return response
        else:
            return {"error": "LaTeX compilation failed"}, 500

    except Exception as e:
        print("[ERROR] Exception in /compile:", str(e))
        return {"error": str(e)}, 500


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
    """Enroll a user in an internship"""
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

        # Create enrollment
        enrollment = {
            'user_id': user_id,
            'user_name': user_name or user_email.split('@')[0],
            'user_email': user_email,
            'internship_id': str(internship_id),
            'internship_name': internship_name,
            'enrolled_at': datetime.now().isoformat()
        }
        
        course_enrollments.append(enrollment)
        save_enrollments(course_enrollments)
        
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


@app.route('/admin/internships/<internship_id>/candidates', methods=['GET'])
def get_internship_candidates(internship_id):
    """Get all candidates enrolled in a specific internship"""
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
        
        # Get internship name from first enrollment or default
        internship_name = candidates[0]['internship_name'] if candidates else 'Internship'
        
        return jsonify({
            'internship_id': internship_id,
            'internship_name': internship_name,
            'candidates': candidates,
            'total_count': len(candidates)
        }), 200

    except Exception as e:
        print(f"[ERROR] Failed to fetch candidates: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return '''
    <h2>Welcome to the ATS Backend</h2>
    <p>This is the backend server. Use POST /upload_resume to upload resumes.</p>
    '''

if __name__ == '__main__':
    app.run(port=5000, debug=True)

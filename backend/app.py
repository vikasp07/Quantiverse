from flask import Flask, request, jsonify,send_file
import os
import json
from resume_parser import extract_text_from_pdf
from match_gemini import match_skills
from werkzeug.utils import secure_filename 
import secrets
from flask_cors import CORS
from utils import generate_latex, compile_latex_to_pdf
import io
from flask import make_response
from gemini_resume_builder_helper import refine_all_bullets
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

# Enrollment management endpoints
@app.route('/enrollments', methods=['GET'])
def get_all_enrollments():
    """Get all enrollments"""
    try:
        with open('enrollments.json', 'r') as f:
            enrollments = json.load(f)
        return jsonify(enrollments)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enrollments/user/<user_id>', methods=['GET'])
def get_user_enrollments(user_id):
    """Get enrollments for a specific user"""
    try:
        with open('enrollments.json', 'r') as f:
            enrollments = json.load(f)
        user_enrollments = [e for e in enrollments if e['user_id'] == user_id]
        return jsonify(user_enrollments)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enrollments/simulation/<simulation_id>', methods=['GET'])
def get_simulation_enrollments(simulation_id):
    """Get enrollments for a specific simulation"""
    try:
        with open('enrollments.json', 'r') as f:
            enrollments = json.load(f)
        sim_enrollments = [e for e in enrollments if e['simulation_id'] == simulation_id]
        return jsonify(sim_enrollments)
    except FileNotFoundError:
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/enrollments', methods=['POST'])
def create_enrollment():
    """Create a new enrollment"""
    try:
        data = request.json
        
        # Load existing enrollments
        try:
            with open('enrollments.json', 'r') as f:
                enrollments = json.load(f)
        except FileNotFoundError:
            enrollments = []
        
        # Add new enrollment
        enrollments.append(data)
        
        # Save back to file
        with open('enrollments.json', 'w') as f:
            json.dump(enrollments, f, indent=2)
        
        return jsonify({'message': 'Enrollment created successfully', 'enrollment': data}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    

@app.route('/')
def index():
    return '''
    <h2>Welcome to the ATS Backend</h2>
    <p>This is the backend server. Use POST /upload_resume to upload resumes.</p>
    <h3>Available Endpoints:</h3>
    <ul>
        <li>POST /upload_resume - Upload and analyze resume</li>
        <li>POST /compile - Compile resume to PDF</li>
        <li>GET /enrollments - Get all enrollments</li>
        <li>GET /enrollments/user/&lt;user_id&gt; - Get user enrollments</li>
        <li>GET /enrollments/simulation/&lt;simulation_id&gt; - Get simulation enrollments</li>
        <li>POST /enrollments - Create new enrollment</li>
    </ul>
    '''

if __name__ == '__main__':
    app.run(port=5000, debug=True)

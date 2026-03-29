import os
import hashlib
import secrets
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from paddleocr import PaddleOCR
import psycopg2
import psycopg2.extras
from datetime import datetime

from features.output_formatter import format_core_output
from features.medicine_correction import detect_and_correct_medicine
from features.prescription_nlp import extract_prescription_details
from features.medical_classification import classify_medical_item
from features.summary_generator import generate_patient_summary
from features.download_manager import generate_downloadable_report
from features.medicine_db import get_medicine_uses

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
#  PostgreSQL connection config  (from .env)
# ─────────────────────────────────────────────
DB_CONFIG = {
    "dbname":   os.getenv("DB_NAME",     "medicine-data"),
    "user":     os.getenv("DB_USER",     "postgres"),
    "password": os.getenv("DB_PASSWORD", "8484"),
    "host":     os.getenv("DB_HOST",     "localhost"),
    "port":     os.getenv("DB_PORT",     "5432"),
}

def get_db():
    """Open and return a psycopg2 connection."""
    return psycopg2.connect(**DB_CONFIG)


# ─────────────────────────────────────────────
#  Auto-create tables on startup
# ─────────────────────────────────────────────
def init_db():
    conn = get_db()
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id            SERIAL PRIMARY KEY,
            name          TEXT NOT NULL,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt          TEXT NOT NULL,
            created_at    TIMESTAMP DEFAULT NOW()
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS scan_history (
            id          SERIAL PRIMARY KEY,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            image_name  TEXT,
            item_count  INTEGER DEFAULT 0,
            results     JSONB,
            scanned_at  TIMESTAMP DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("[DB] Tables ready: users, scan_history")


# ─────────────────────────────────────────────
#  Password helpers
# ─────────────────────────────────────────────
def hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + password).encode()).hexdigest()

def verify_password(password: str, salt: str, stored_hash: str) -> bool:
    return hash_password(password, salt) == stored_hash


# ─────────────────────────────────────────────
#  AUTH  —  POST /register
# ─────────────────────────────────────────────
@app.route('/register', methods=['POST'])
def register():
    data     = request.json or {}
    name     = (data.get('name')     or '').strip()
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not name or not email or not password:
        return jsonify({"success": False, "error": "Name, email and password are required."}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters."}), 400

    salt          = secrets.token_hex(16)
    password_hash = hash_password(password, salt)

    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            INSERT INTO users (name, email, password_hash, salt)
            VALUES (%s, %s, %s, %s)
            RETURNING id, name, email, created_at
            """,
            (name, email, password_hash, salt)
        )
        user = dict(cur.fetchone())
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Account created successfully.",
            "user": {
                "id":    user["id"],
                "name":  user["name"],
                "email": user["email"],
            }
        }), 201

    except psycopg2.errors.UniqueViolation:
        return jsonify({"success": False, "error": "An account with this email already exists."}), 409
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  AUTH  —  POST /login
# ─────────────────────────────────────────────
@app.route('/login', methods=['POST'])
def login():
    data     = request.json or {}
    email    = (data.get('email')    or '').strip().lower()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required."}), 400

    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user:
            return jsonify({"success": False, "error": "No account found with this email."}), 404

        if not verify_password(password, user["salt"], user["password_hash"]):
            return jsonify({"success": False, "error": "Incorrect password."}), 401

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": {
                "id":    user["id"],
                "name":  user["name"],
                "email": user["email"],
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  HISTORY  —  GET /history/<user_id>
# ─────────────────────────────────────────────
@app.route('/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            SELECT id, image_name, item_count, results, scanned_at
            FROM   scan_history
            WHERE  user_id = %s
            ORDER  BY scanned_at DESC
            LIMIT  50
            """,
            (user_id,)
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        history = [
            {
                "id":         row["id"],
                "imageName":  row["image_name"],
                "itemCount":  row["item_count"],
                "results":    row["results"],
                "date":       row["scanned_at"].isoformat(),
            }
            for row in rows
        ]

        return jsonify({"success": True, "history": history}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  HISTORY  —  POST /history
# ─────────────────────────────────────────────
@app.route('/history', methods=['POST'])
def save_history():
    data       = request.json or {}
    user_id    = data.get('user_id')
    image_name = data.get('image_name', 'unknown')
    item_count = data.get('item_count', 0)
    results    = data.get('results', [])

    if not user_id:
        return jsonify({"success": False, "error": "user_id is required."}), 400

    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute(
            """
            INSERT INTO scan_history (user_id, image_name, item_count, results)
            VALUES (%s, %s, %s, %s)
            RETURNING id, scanned_at
            """,
            (user_id, image_name, item_count, psycopg2.extras.Json(results))
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success":   True,
            "id":        row["id"],
            "scanned_at": row["scanned_at"].isoformat(),
        }), 201

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  HISTORY  —  DELETE /history/<history_id>
# ─────────────────────────────────────────────
@app.route('/history/<int:history_id>', methods=['DELETE'])
def delete_history(history_id):
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"success": False, "error": "user_id query param required."}), 400
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "DELETE FROM scan_history WHERE id = %s AND user_id = %s",
            (history_id, user_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  OCR  —  POST /predict
# ─────────────────────────────────────────────
ocr = PaddleOCR(
 rec_model_dir='./output/rec/best_model', 
    lang='en',
    use_angle_cls=False,
    use_gpu=False,
    show_log=False
)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    file      = request.files['file']
    temp_path = "temp_upload.png"
    file.save(temp_path)

    try:
        result       = ocr.ocr(temp_path, cls=False)
        detected_text = format_core_output(result)

        # 🟢 ADDED: Visual separator in your terminal
        print("\n" + "="*50)
        print("📄 NEW PRESCRIPTION SCAN STARTED")
        print("="*50)

        for item in detected_text:
            text_content  = item["text"]
            
            # 🟢 ADDED: Print exactly what OCR sees before any corrections
            print(f"🔍 RAW OCR TEXT: '{text_content}'")
            
            corrected_name = detect_and_correct_medicine(text_content)
            details        = extract_prescription_details(text_content)

            if details:
                item["is_medicine"]   = True
                final_name            = corrected_name if corrected_name else details["medicine_name"]
                item["medicine_name"] = final_name
                description           = get_medicine_uses(final_name)
                item["description"]   = description if description else "Medical information not available in local database."
                item['type']          = classify_medical_item(text_content)
                item['summary']       = generate_patient_summary(item)
            else:
                item["is_medicine"]   = False
                item["medicine_name"] = None
                item["description"]   = None
                item['type']          = "Text"
                item['summary']       = None

        print("="*50 + "\n")
        return jsonify({"success": True, "data": detected_text})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# ─────────────────────────────────────────────
#  REPORT  —  POST /download_report
# ─────────────────────────────────────────────
@app.route('/download_report', methods=['POST'])
def download_report():
    try:
        data           = request.json.get('data', [])
        report_content = generate_downloadable_report(data)
        return Response(
            report_content,
            mimetype="text/plain",
            headers={"Content-disposition": "attachment; filename=prescription_report.txt"}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────
#  STARTUP
# ─────────────────────────────────────────────
if __name__ == '__main__':
    init_db()          
    app.run(debug=True, port=5000)
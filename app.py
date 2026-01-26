import os
import re
import json
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from paddleocr import PaddleOCR
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
from features.output_formatter import format_core_output
from features.medicine_correction import detect_and_correct_medicine
from features.prescription_nlp import extract_prescription_details
from features.medical_classification import classify_medical_item
from features.summary_generator import generate_patient_summary
from features.download_manager import generate_downloadable_report
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

# -----------------------------------------------------------
# ✅ INITIALIZE LOCAL OCR (UNCHANGED)
# -----------------------------------------------------------
ocr = PaddleOCR(
    rec_model_dir='./models/en_PP-OCRv4_rec_infer',
    lang='en',
    use_angle_cls=False,
    use_gpu=False,
    show_log=False
)

# -----------------------------------------------------------
# ✅ OCR CONFIDENCE SCORING (RULE-BASED, NON-AI)
# -----------------------------------------------------------
MEDICAL_KEYWORDS = [
    "mg", "ml", "tablet", "tab", "capsule", "syrup",
    "od", "bd", "tds", "hs", "morning", "night", "after food"
]

OCR_CONFIDENCE_THRESHOLD = 0.6

def calculate_ocr_confidence(detected_text):
    if not detected_text:
        return 0.0

    total_lines = len(detected_text)
    valid_text_lines = 0
    medical_hits = 0
    medicine_detected = 0

    for item in detected_text:
        text = item.get("text", "").lower()

        if re.search(r"[a-zA-Z]{3,}", text):
            valid_text_lines += 1

        for kw in MEDICAL_KEYWORDS:
            if kw in text:
                medical_hits += 1
                break

        if item.get("is_medicine"):
            medicine_detected += 1

    confidence = (
        0.25 * min(total_lines / 6, 1.0) +
        0.25 * (valid_text_lines / total_lines) +
        0.25 * min(medical_hits / 3, 1.0) +
        0.25 * (1.0 if medicine_detected > 0 else 0.0)
    )

    return round(confidence, 2)

# -----------------------------------------------------------
# ✅ GEMINI PRESCRIPTION SCHEMA
# -----------------------------------------------------------
GEMINI_PRESCRIPTION_SCHEMA = {
    "type": "object",
    "properties": {
        "doctorName": {"type": "string"},
        "patientName": {"type": "string"},
        "date": {"type": "string"},
        "summary": {"type": "string"},
        "medications": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "dosage": {"type": "string"},
                    "frequency": {"type": "string"},
                    "duration": {"type": "string"},
                    "instructions": {"type": "string"},
                    "purpose": {"type": "string"}
                }
            }
        },
        "notes": {"type": "string"},
        "confidenceScore": {"type": "number"}
    },
    "required": ["medications", "summary"]
}

# -----------------------------------------------------------
# ✅ GEMINI VISION FALLBACK (AI OCR + ANALYSIS)
# -----------------------------------------------------------
def gemini_fallback_analysis(image_path):
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = """
You are an expert pharmacist AI assistant.

Analyze the handwritten medical prescription image and:
1. Extract readable text accurately
2. Correct medicine names
3. Identify dosage, frequency, duration
4. Infer the medical purpose of each medicine

Rules:
- Do NOT hallucinate
- If a field is not visible, return an empty string
- Return STRICT JSON matching the provided schema
"""

    response = model.generate_content(
        [
            {
                "mime_type": "image/png",
                "data": open(image_path, "rb").read()
            },
            {"text": prompt}
        ],
        generation_config={
            "temperature": 0.1,
            "response_mime_type": "application/json",
            "response_schema": GEMINI_PRESCRIPTION_SCHEMA
        }
    )

    if not response.text:
        raise ValueError("Empty response from Gemini")

    return json.loads(response.text)

# -----------------------------------------------------------
# ✅ MAIN OCR + ANALYSIS ENDPOINT
# -----------------------------------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    temp_path = "temp_upload.png"
    file.save(temp_path)

    try:
        # 1️⃣ RUN LOCAL OCR & PRINT TO TERMINAL
        print("\n" + "="*50)
        print("📝 LOCAL OCR OUTPUT (PADDLEOCR)")
        print("="*50)
        
        result = ocr.ocr(temp_path, cls=False)
        detected_text = format_core_output(result)
        
        # Pretty-print the local OCR result to your terminal
        print(json.dumps(detected_text, indent=4))
        print("="*50 + "\n")

        # 2️⃣ RUN AI ANALYSIS FOR FRONTEND
        print("🚀 Requesting AI Analysis from Gemini...")
        
        # Note: Ensure gemini_fallback_analysis uses "gemini-1.5-flash"
        ai_analysis = gemini_fallback_analysis(temp_path)

        # ✅ NORMALIZE AI OUTPUT FOR FRONTEND
        # This keeps your frontend keys consistent (medicine_name, summary, etc.)
        normalized_results = []
        for med in ai_analysis.get("medications", []):
            normalized_results.append({
                "text": med.get("name", ""),
                "medicine_name": med.get("name", ""),
                "is_medicine": True,
                "dosage": med.get("dosage", ""),
                "frequency": med.get("frequency", ""),
                "duration": med.get("duration", ""),
                "type": "Medicine",
                "summary": (
                    f"Dosage: {med.get('dosage', '')}, "
                    f"Frequency: {med.get('frequency', '')}, "
                    f"Duration: {med.get('duration', '')}, "
                    f"Purpose: {med.get('purpose', '')}"
                )
            })

        # Add notes if available
        if ai_analysis.get("notes"):
            normalized_results.append({
                "text": "General Notes",
                "is_medicine": False,
                "type": "Notes",
                "summary": ai_analysis.get("notes")
            })

        # 3️⃣ RETURN ONLY AI DATA TO FRONTEND
        return jsonify({
            "success": True,
            "source": "GEMINI_AI",
            "data": normalized_results,
            "metadata": {
                "doctor": ai_analysis.get("doctorName"),
                "patient": ai_analysis.get("patientName"),
                "date": ai_analysis.get("date")
            }
        })

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
# -----------------------------------------------------------
# ✅ DOWNLOAD REPORT ENDPOINT
# -----------------------------------------------------------
@app.route('/download_report', methods=['POST'])
def download_report():
    try:
        data = request.json.get("data", [])
        report_content = generate_downloadable_report(data)

        return Response(
            report_content,
            mimetype="text/plain",
            headers={"Content-disposition": "attachment; filename=prescription_report.txt"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

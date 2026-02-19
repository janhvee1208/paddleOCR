import os
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from paddleocr import PaddleOCR

# ✅ FEATURES INTEGRATION
from features.output_formatter import format_core_output
from features.medicine_correction import detect_and_correct_medicine
from features.prescription_nlp import extract_prescription_details
from features.medical_classification import classify_medical_item
from features.summary_generator import generate_patient_summary
from features.download_manager import generate_downloadable_report 
from features.medicine_db import get_medicine_uses

app = Flask(__name__)
CORS(app)

# ✅ INITIALIZE CUSTOM LOCAL OCR
# Using your specified inference model path
ocr = PaddleOCR(rec_model_dir='./models/en_PP-OCRv4_rec_infer',
                lang='en',
                use_angle_cls=False,
                use_gpu=False,
                show_log=False)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400

    file = request.files['file']
    temp_path = "temp_upload.png"
    file.save(temp_path)

    try:
        # 1️⃣ Primary OCR Scan
        result = ocr.ocr(temp_path, cls=False)
        detected_text = format_core_output(result)

        # 2️⃣ Intelligent Processing Loop
        for item in detected_text:
            text_content = item["text"]
            
            # Step A: Identify and correct the medicine name using PostgreSQL
            corrected_name = detect_and_correct_medicine(text_content)

            if corrected_name:
                item["is_medicine"] = True
                item["medicine_name"] = corrected_name
                
                # Step B: Fetch 'uses' info from PostgreSQL
                description = get_medicine_uses(corrected_name)
                item["description"] = description if description else "Medical details not found in local database."
                
                # Step C: Advanced Analysis (NLP, Type, and Summary)
                # This links your 321-medicine database with active prescription analysis
                details = extract_prescription_details(text_content)
                item.update(details)
                
                item['type'] = classify_medical_item(text_content)
                item['summary'] = generate_patient_summary(item)
            else:
                item["is_medicine"] = False
                item["medicine_name"] = None
                item["description"] = None
                item['type'] = "Text"
                item['summary'] = None

        print(f"✅ Processed {len(detected_text)} lines.")
        return jsonify({
            "success": True,
            "data": detected_text
        })

    except Exception as e:
        print(f"❌ Server Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/download_report', methods=['POST'])
def download_report():
    try:
        data = request.json.get('data', [])
        report_content = generate_downloadable_report(data)
        
        return Response(
            report_content,
            mimetype="text/plain",
            headers={"Content-disposition": "attachment; filename=prescription_report.txt"}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
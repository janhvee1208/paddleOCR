import os
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from paddleocr import PaddleOCR

# ✅ FEATURES
from features.output_formatter import format_core_output
from features.medicine_correction import detect_and_correct_medicine
from features.prescription_nlp import extract_prescription_details
from features.medical_classification import classify_medical_item
from features.summary_generator import generate_patient_summary
from features.download_manager import generate_downloadable_report 

app = Flask(__name__)
CORS(app)

# Initialize OCR
ocr = PaddleOCR(rec_model_dir='./models/en_PP-OCRv4_rec_infer',
                lang='en',
                use_angle_cls=False,
                use_gpu=False,
                show_log=False)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    temp_path = "temp_upload.png"
    file.save(temp_path)
    
    try:
        # 1. Run OCR
        result = ocr.ocr(temp_path, cls=False)
        
        # 2. Format Output
        detected_text = format_core_output(result)
        
        # 3. Analyze Each Line
        for item in detected_text:
            text_content = item['text']
            
            # A. Check for Medicine
            detected_med = detect_and_correct_medicine(text_content)
            
            if detected_med:
                item['is_medicine'] = True
                item['medicine_name'] = detected_med
                item['original_text'] = item['text']
                item['text'] = detected_med 
                
                # B. Details
                details = extract_prescription_details(text_content)
                item.update(details)
                
                # C. Type
                item['type'] = classify_medical_item(text_content)
                
                # D. Summary
                item['summary'] = generate_patient_summary(item)
                
            else:
                item['is_medicine'] = False
                item['medicine_name'] = None
                item['type'] = "Text"
                item['summary'] = None

        print(f"✅ Processed {len(detected_text)} lines.")
        return jsonify({"success": True, "data": detected_text})
        
    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# -----------------------------------------------------------
# ✅ THIS WAS MISSING: The Download Endpoint
# -----------------------------------------------------------
@app.route('/download_report', methods=['POST'])
def download_report():
    try:
        # Frontend sends the JSON data back to us to format
        data = request.json.get('data', [])
        
        # Generate the text report
        report_content = generate_downloadable_report(data)
        
        # Return as a downloadable text file
        return Response(
            report_content,
            mimetype="text/plain",
            headers={"Content-disposition": "attachment; filename=prescription_report.txt"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from paddleocr import PaddleOCR

# ✅ FEATURES IMPORTS (Corrected)
from features.output_formatter import format_core_output
from features.medicine_correction import detect_and_correct_medicine

app = Flask(__name__)
CORS(app)

# Initialize OCR
ocr = PaddleOCR(rec_model_dir='./models/rec_v4',
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
        # 1. Run OCR Engine
        result = ocr.ocr(temp_path, cls=False)
        
        # 2. Format Output (Phase 1)
        detected_text = format_core_output(result)
        
        # -----------------------------------------------------------
        # ✅ PHASE 2: Detect & OVERWRITE Text
        # -----------------------------------------------------------
        for item in detected_text:
            text_content = item['text']
            
            # Check if this text is a medicine
            detected_med = detect_and_correct_medicine(text_content)
            
            if detected_med:
                item['is_medicine'] = True
                item['medicine_name'] = detected_med
                
                # ⭐ CRITICAL FIX FOR REACT ⭐
                # We overwrite 'text' so React displays the corrected name automatically.
                item['original_text'] = item['text'] # Backup original
                item['text'] = detected_med          # Update Display Text
                
            else:
                item['is_medicine'] = False
                item['medicine_name'] = None
        # -----------------------------------------------------------

        print(f"✅ Processed {len(detected_text)} lines.")
        return jsonify({"success": True, "data": detected_text})
        
    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
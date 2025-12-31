
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from paddleocr import PaddleOCR

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # Allow React to communicate with this server

# ✅ UPDATED: Pointing to your LOCAL downloaded model
# This uses the files inside 'models/rec_v4/' that you showed me earlier
ocr = PaddleOCR(rec_model_dir='./models/rec_v4',
                lang='en',
                use_angle_cls=False,
                use_gpu=False)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    # Save the image temporarily
    temp_path = "temp_upload.png"
    file.save(temp_path)
    
    try:
        # Run Inference
        result = ocr.ocr(temp_path, cls=False)
        
        detected_text = []
        if result and result[0]:
            for line in result[0]:
                text = line[1][0]
                confidence = line[1][1]
                detected_text.append({"text": text, "confidence": float(confidence)})
        
        return jsonify({"success": True, "data": detected_text})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

import os
import logging

# 1. CRITICAL: Disable the crashing engine and connectivity checks
os.environ['FLAGS_use_onednn'] = '0'
os.environ["DISABLE_MODEL_SOURCE_CHECK"] = "True"

from paddleocr import PaddleOCR

# 2. Silence unnecessary logs for a clean output
logging.getLogger("ppocr").setLevel(logging.ERROR)

# 3. Initialize the model using your local folders
# These paths point to the models you downloaded earlier
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='en',
    det_model_dir='./models/det_v3/',
    rec_model_dir='./models/rec_v4/',
    cls_model_dir='./models/cls_v2/',
    use_gpu=False,
    enable_mkldnn=False,  # This keeps it stable on your CPU
    show_log=False
)

# 4. Path to your test image (Change 'i18.jpg' to your actual file name)
img_path = './train_data/images/373.png' 

if os.path.exists(img_path):
    print(f"\n--- Testing Image: {os.path.basename(img_path)} ---")
    
    # Run the OCR
    result = ocr.ocr(img_path, cls=True)
    
    if result and result[0]:
        print(f"{'Text Found':<25} | {'Confidence'}")
        print("-" * 40)
        for line in result[0]:
            text = line[1][0]
            confidence = line[1][1]
            print(f"{text:<25} | {confidence:.2%}")
    else:
        print("Model finished but detected no text. Check if the image is blurry.")
else:
    print(f"Error: Could not find image at {img_path}")
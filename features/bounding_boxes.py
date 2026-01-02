# features/bounding_boxes.py

def extract_bounding_boxes(ocr_result):
    """
    Extract text, confidence, and bounding box coordinates
    from PaddleOCR output.

    Parameters:
        ocr_result (list): Raw output from PaddleOCR

    Returns:
        list: List of dictionaries with text, confidence, and box
    """

    detections = []

    # PaddleOCR returns a list for each image
    if not ocr_result or not ocr_result[0]:
        return detections

    for line in ocr_result[0]:
        box_points = line[0]          # 4 corner points
        text = line[1][0]             # detected text
        confidence = line[1][1]       # confidence (0–1)

        detections.append({
            "text": text,
            "confidence": round(confidence * 100, 2),
            "box": box_points
        })

    return detections

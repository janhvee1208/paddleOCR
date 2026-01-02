def format_core_output(raw_ocr_result):
    """
    PHASE 1 FEATURE: Core Output Formatting
    
    Takes the raw, messy output from PaddleOCR:
    [ [ [[x,y],...], ("Text", 0.98) ], ... ]
    
    Returns a clean, structured list:
    [ {"id": 1, "text": "Text", "confidence": 0.98}, ... ]
    """
    formatted_data = []

    # Handle cases where OCR finds nothing or errors out
    if not raw_ocr_result or raw_ocr_result[0] is None:
        return []

    # PaddleOCR returns a list of lines. We iterate through them.
    # Structure of 'line': [ [box_coords], ("detected_text", confidence) ]
    for index, line in enumerate(raw_ocr_result[0]):
        try:
            # Extract the text info tuple
            text_info = line[1]
            detected_text = text_info[0]
            confidence_score = float(text_info[1])

            # Create the clean object
            data_object = {
                "id": index + 1,  # Simple incremental ID (1, 2, 3...)
                "text": detected_text.strip(),
                "confidence": round(confidence_score, 2) # Round to 2 decimals
            }
            
            formatted_data.append(data_object)

        except Exception as e:
            # If one line fails, print error but don't crash the whole app
            print(f"⚠️ Error parsing line {index}: {e}")
            continue

    return formatted_data
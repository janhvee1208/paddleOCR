def generate_patient_summary(item):
    """
    PHASE 5: Generates a human-readable summary sentence.
    Input: { "medicine_name": "Paracetamol", "frequency": "BD", "type": "Tablet", ... }
    Output: "Tablet Paracetamol - Take twice daily"
    """
    if not item.get('is_medicine'):
        return None

    # 1. Start with the Type and Name (e.g., "Tablet Paracetamol")
    med_type = item.get('type', 'Medicine')
    name = item.get('medicine_name', 'Unknown')
    dosage = item.get('dosage', '')
    
    summary_parts = [f"{med_type} {name}"]
    
    # 2. Add Dosage if available
    if dosage:
        summary_parts.append(f"({dosage})")
        
    # 3. Translate Frequency codes to English
    freq_map = {
        "OD": "Take once daily",
        "BD": "Take twice daily",
        "BID": "Take twice daily",
        "TDS": "Take three times daily",
        "TID": "Take three times daily",
        "QID": "Take four times daily",
        "SOS": "Take only when needed",
        "HS": "Take at night",
        "BBF": "Take before breakfast",
        "PC": "Take after food",
        "AC": "Take before food"
    }
    
    freq_code = item.get('frequency')
    if freq_code and freq_code in freq_map:
        summary_parts.append(f"- {freq_map[freq_code]}")
    elif freq_code:
        summary_parts.append(f"- {freq_code}")

    # 4. Add Duration
    duration = item.get('duration')
    if duration:
        summary_parts.append(f"for {duration}")

    return " ".join(summary_parts)
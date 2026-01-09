import re #Named Entity Recognition (NER) via Regex (Regular Expressions (re library))

def extract_prescription_details(text):
    """
    PHASE 3: Analyzing the prescription line for Dosage, Frequency, and Duration.
    Input: "Paracetamol 500mg BD for 5 days"
    Output: { "dosage": "500mg", "frequency": "BD", "duration": "5 days" }
    """
    details = {
        "dosage": None,
        "frequency": None,
        "duration": None
    }
    
    # 1. DOSAGE PATTERNS (e.g., 500mg, 10ml, 1 tab, 650 mg)
    # Regex looks for: digits + optional space + unit
    dosage_pattern = r'(\d+\s?(?:mg|ml|g|mcg|tab|cap|tablet|capsule))'
    dosage_match = re.search(dosage_pattern, text, re.IGNORECASE)
    if dosage_match:
        details['dosage'] = dosage_match.group(0)

    # 2. FREQUENCY PATTERNS (Medical abbreviations)
    # OD = Once, BD/BID = Twice, TDS/TID = Thrice, SOS = Emergency
    freq_pattern = r'\b(OD|BD|BID|TDS|TID|QID|SOS|HS|BBF|PC|AC)\b'
    freq_match = re.search(freq_pattern, text, re.IGNORECASE)
    if freq_match:
        details['frequency'] = freq_match.group(0).upper()

    # 3. DURATION PATTERNS (e.g., 5 days, 1 week, 2 months)
    duration_pattern = r'(\d+\s?(?:day|days|week|weeks|month|months))'
    duration_match = re.search(duration_pattern, text, re.IGNORECASE)
    if duration_match:
        details['duration'] = duration_match.group(0)

    return details
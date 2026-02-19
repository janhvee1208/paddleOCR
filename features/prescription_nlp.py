import re

def extract_prescription_details(text):

    noise_patterns = r'\b(Dr|Doctor|Age|Sex|Gender|Name|Address|Date|Clinic|Hospital|Phone|Contact|Rx)\b'

    if re.search(noise_patterns, text, re.IGNORECASE):
        return None

    dosage_pattern = r'(\d+\s?(?:mg|ml|g|mcg|tab|cap|tablet|capsule))'
    dosage_match = re.search(dosage_pattern, text, re.IGNORECASE)

    dosage = dosage_match.group(0) if dosage_match else None

    clean_name = re.sub(r'[^\w\s]', '', text).strip()

    if not clean_name or clean_name.isdigit() or len(clean_name) <= 3:
        return None

    return {
        "medicine_name": clean_name,
        "dosage": dosage,
        "is_medicine": True
    }

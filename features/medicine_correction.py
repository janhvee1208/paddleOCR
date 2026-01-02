import difflib

# 1. Database of Medicines
MEDICINE_DB = [
    "Paracetamol", "Ibuprofen", "Aspirin", "Amoxicillin", "Metformin",
    "Atorvastatin", "Omeprazole", "Azithromycin", "Ciprofloxacin", 
    "Dolo", "Pan D", "Augmentin", "Crosin", "Pantoprazole", "Cetirizine"
]

def detect_and_correct_medicine(text_line):
    """
    Scans a line of text to see if any word looks like a known medicine.
    Returns: The corrected medicine name (if found), or None.
    """
    if not text_line:
        return None

    # Clean the text (remove punctuation roughly)
    clean_text = ''.join(e for e in text_line if e.isalnum() or e.isspace())
    words = clean_text.split()
    
    for word in words:
        if len(word) < 3:
            continue
            
        # 1. Convert word to lowercase for better matching
        word_lower = word.lower()
        
        # 2. Create a lowercase list of our DB for comparison
        db_lower = [m.lower() for m in MEDICINE_DB]
        
        # 3. Get matches with LOWER strictness (0.5)
        matches = difflib.get_close_matches(word_lower, db_lower, n=1, cutoff=0.5)
        
        if matches:
            match_lower = matches[0]
            # Find the original "Capitalized" name
            original_name = MEDICINE_DB[db_lower.index(match_lower)]
            
            print(f"💊 Medicine Detected: '{word}' -> Corrected to '{original_name}'")
            return original_name

    return None
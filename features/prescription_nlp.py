# import re

# def extract_prescription_details(text):

#     noise_patterns = r'\b(Dr|Doctor|Age|Sex|Gender|Name|Address|Date|Clinic|Hospital|Phone|Contact|Rx)\b'

#     if re.search(noise_patterns, text, re.IGNORECASE):
#         return None

#     dosage_pattern = r'(\d+\s?(?:mg|ml|g|mcg|tab|cap|tablet|capsule))'
#     dosage_match = re.search(dosage_pattern, text, re.IGNORECASE)

#     dosage = dosage_match.group(0) if dosage_match else None

#     clean_name = re.sub(r'[^\w\s]', '', text).strip()

#     if not clean_name or clean_name.isdigit() or len(clean_name) <= 3:
#         return None

#     return {
#         "medicine_name": clean_name,
#         "dosage": dosage,
#         "is_medicine": True
#     }

import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.tag import pos_tag

# Safely download required NLTK datasets on first run
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)

def extract_prescription_details(text):
    """
    Extracts medicine details using Natural Language Processing (NLTK Tokenization & POS Tagging).
    """
    
    # 🛑 1. Context Check: Reject Administrative Noise (Headers)
    # If the sentence contains context clues that belong to a header, reject it.
    noise_patterns = r'\b(Dr|Doctor|Age|Sex|Gender|Name|Address|Date|Clinic|Hospital|Phone|Contact|Rx|Reg|MBBS|Pune)\b'
    if re.search(noise_patterns, text, re.IGNORECASE):
        return None

    # 🔍 2. Slot Filling: Extract the Dosage Context
    dosage_pattern = r'(\d+\s?(?:mg|ml|g|mcg|tab|cap|tablet|capsule|drops?))'
    dosage_match = re.search(dosage_pattern, text, re.IGNORECASE)
    dosage = dosage_match.group(0) if dosage_match else None

    # 🧠 3. NLP Processing: Isolate the Medicine Name
    # Remove the dosage and numbers so they don't confuse the POS tagger
    text_without_dosage = re.sub(dosage_pattern, '', text, flags=re.IGNORECASE)
    text_without_numbers = re.sub(r'\d+', '', text_without_dosage)
    
    # Replace punctuation with spaces for clean tokenization
    clean_text = re.sub(r'[^\w\s]', ' ', text_without_numbers).strip()

    if not clean_text or len(clean_text) <= 3:
        return None

    # Tokenize the sentence into individual words
    tokens = word_tokenize(clean_text)
    
    # Tag each word with its Part-of-Speech (e.g., Noun, Verb, Adjective)
    tagged_tokens = pos_tag(tokens)

    # 🏷️ 4. Named Entity Recognition (NER) Alternative
    # Medicines are typically Nouns (NN, NNS, NNP, NNPS). We extract ONLY the nouns.
    # We also actively ignore common medication forms to leave JUST the drug name.
    forms_to_ignore = ['tab', 'tablet', 'cap', 'capsule', 'syr', 'syrup', 'inj', 'injection', 'lab']
    
    extracted_nouns = []
    for word, tag in tagged_tokens:
        # If the tag starts with 'NN' (Noun) and isn't a generic form word
        if tag.startswith('NN') and word.lower() not in forms_to_ignore:
            extracted_nouns.append(word)

    # Rejoin the extracted nouns into the final medicine name
    medicine_name = " ".join(extracted_nouns).strip()

    # Fallback: If NLTK was too aggressive, use the cleaned text
    if not medicine_name:
        medicine_name = clean_text.strip()

    # 🛡️ 5. Final Validation
    # If the remaining word is too short and has no dosage context, drop it.
    if len(medicine_name) <= 3 and not dosage:
        return None

    return {
        "medicine_name": medicine_name,
        "dosage": dosage,
        "is_medicine": True
    }
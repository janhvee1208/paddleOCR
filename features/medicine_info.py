# A simple dictionary mapping medicine names to brief descriptions
MEDICINE_INFO = {
    "Paracetamol": "Common painkiller used to treat aches, pain, and fever.",
    "Ibuprofen": "NSAID used to reduce fever and treat pain or inflammation.",
    "Amoxicillin": "Antibiotic used to treat bacterial infections like chest infections and dental abscesses.",
    "Aspirin": "Used to reduce fever and relieve mild to moderate pain.",
    "Metformin": "Used to treat type 2 diabetes by helping control blood sugar levels.",
    "Atorvastatin": "Statin medication used to lower cholesterol and reduce risk of heart disease.",
    "Omeprazole": "Used to treat indigestion, heartburn, and acid reflux.",
    "Azithromycin": "Antibiotic used for various bacterial infections.",
    "Ciprofloxacin": "Antibiotic used to treat serious bacterial infections.",
    "Pantoprazole": "Used to treat stomach ulcers and acid reflux.",
    "Cetirizine": "Antihistamine used to relieve allergy symptoms like runny nose and sneezing.",
    "Dolo": "Brand name for Paracetamol, used for fever and pain relief.",
    "Pan D": "Combination medicine used to treat acidity and indigestion.",
    "Augmentin": "Antibiotic used to treat bacterial infections.",
    "Crosin": "Brand name for Paracetamol, used for fever and pain relief."
}

def get_medicine_description(med_name):
    """
    Returns a brief description for a given medicine name.
    """
    return MEDICINE_INFO.get(med_name, "Consult your doctor for more details about this medicine.")
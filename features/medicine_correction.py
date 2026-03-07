import difflib
from features.medicine_db import fetch_all_medicine_names

# 1. Database of Medicines
MEDICINE_DB = [
    "Acarbose", "Ace", "Aceclofenac", "Aceta", "Aclidinium", "Albendazole",
"Alogliptin", "Alprazolam", "Alatrol", "Aminophylline", "Amitriptyline",
"Amlodipine", "Amodis", "Ampicillin", "Amoxicillin", "Apixaban",
"Aripiprazole", "Artemether", "Aspirin", "AspirinLowDose",
"Atorvastatin", "Atovaquone", "Atenolol", "Atrizin", "Augmentin",
"Axodin", "Az", "Azathioprine", "Azithromycin", "AzithromycinBase",
"Azithrocin", "Azyth",
"Bacaid", "Backtone", "Baclofen", "Baclon", "Bacmax", "Beclomethasone",
"Beklo", "Biotin", "Bicozin", "Bisoprolol", "Budesonide", "Bupropion",
"CalciumCarbonate", "CalciumCitrate", "Candesartan", "Canazole",
"Candesartan", "Captopril", "Carbamazepine", "Carvedilol",
"Cefazolin", "Cefepime", "Cefixime", "Cefpodoxime", "Ceftriaxone",
"Ceftazidime", "Cefuroxime", "Cetirizine", "Cetisoft",
"Chloramphenicol", "Chloroquine", "Ciclesonide", "Cimetidine",
"Ciprofloxacin", "Clarithromycin", "Clindamycin", "Clomipramine",
"Clonazepam", "Clopidogrel", "Cloxacillin", "Codeine",
"Colistin", "Conaz", "Crosin", "Cyanocobalamin", "Cyclosporine",
"Dabigatran", "Dancel", "Denixil", "Desloratadine", "Desvenlafaxine",
"Dexamethasone", "Diazepam", "Diclofenac", "Diflu", "Diltiazem",
"Dinafex", "Disopan", "Domperidone", "Doxepin", "Doxycycline",
"Duloxetine",
"Enalapril", "Ertapenem", "Escitalopram", "Esomeprazole", "Esonix",
"Esoral", "Ethambutol", "Ethosuximide", "Etizin", "Ezetimibe",
"Famotidine", "Fenadin", "Fenofibrate", "Felodipine",
"Fexofast", "Fexo", "FexofenadineBase", "Filmet", "Fixal",
"Flamyd", "Fluconazole", "Flucloxacillin", "Fluoxetine",
"Fluphenazine", "Fluticasone", "Fluvastatin", "Flugal",
"Flexibac", "Flexilax", "FolicAcid", "Fosfomycin",
"Gabapentin", "Gemfibrozil", "Gliclazide", "Glimepiride",
"Glyburide", "Granisetron",
"Haloperidol", "Heparin", "Hydralazine", "Hydrocortisone",
"Hydroxychloroquine",
"Imipenem", "Imipramine", "Indomethacin", "InsulinAspart",
"InsulinDetemir", "InsulinGlargine", "InsulinLispro",
"InsulinRegular", "IodineSolution", "Ipratropium",
"Irbesartan", "IronFumarate", "IronGluconate", "IronSulphate",
"IronSucrose", "Isoniazid", "Ivermectin",
"Ketocon", "Ketoral", "Ketorolac", "Ketotab", "Ketozol",
"Labetalol", "Lacosamide", "Lamotrigine", "Lansoprazole",
"Leptic", "Levetiracetam", "Levocetirizine", "Levosalbutamol",
"Levofloxacin", "LevofloxacinTB", "Levothyroxine", "Linezolid",
"Linagliptin", "Liothyronine", "Lisinopril", "Loratadine",
"Losartan", "Lucan-R", "Lumefantrine", "Lumona",
"M-Kast", "MagnesiumOxide", "Maxima", "Maxpro", "Mebendazole",
"Meloxicam", "Meropenem", "Metformin", "Metoclopramide",
"Metoprolol", "Metronidazole", "Methylprednisolone",
"Metsina", "Miglitol", "Midazolam", "Minocycline",
"Minoxidil", "Mirtazapine", "Mometasone", "Monas",
"Montair", "Montelukast", "Montene", "Montex",
"Morphine", "Moxifloxacin", "Mycophenolate",
"Napa", "Napa Extend", "Naproxen", "Nebivolol", "Nexcap",
"Nexum", "Nicardipine", "Niclosamide", "Nidazyl",
"Niacin", "Niacinamide", "Nifedipine", "Nizatidine",
"Nizoder", "Norfloxacin", "Nortriptyline",
"Odmon", "Ofloxacin", "Olanzapine", "Olmesartan",
"Omeprazole", "Omastin", "Ondansetron", "Opton",
"Ornidazole", "Oxazepam",
"Palonosetron", "Pantoprazole", "Paracetamol", "Paroxetine",
"Penicillin", "Phenytoin", "Pioglitazone", "Pitavastatin",
"PolymyxinB", "Praziquantel", "Prednisolone", "Primaquine",
"Progut", "Proguanil", "Propranolol", "Provair",
"Pyrazinamide", "Pyridoxine",
"Quetiapine", "Quinine",
"Rabeprazole", "Ramipril", "Ranitidine", "Renova",
"Rifampicin", "Risperidone", "Ritch", "Rivaroxaban",
"Rivotril", "Romycin", "Rosiglitazone", "Rosuvastatin",
"Roxithromycin", "Rozith",
"Salbutamol", "Saxagliptin", "Secnidazole", "Sergel",
"Sertraline", "Simvastatin", "Sirolimus", "Sitagliptin",
"Spiramycin", "Streptomycin", "Sucralfate", "Sulindac",
"Tacrolimus", "Tamen", "Telmisartan", "Temazepam",
"Terbutaline", "Tetracycline", "Teicoplanin",
"Telfast", "Theophylline", "Thioridazine",
"Tinidazole", "Tiotropium", "Ticagrelor",
"Tolbutamide", "Topiramate", "Tramadol",
"Tridosil", "Trifluoperazine", "Trilock",
"Valproate", "Valsartan", "Vancomycin", "Venlafaxine",
"Verapamil", "Vifas", "VitaminA", "VitaminB1",
"VitaminB2", "VitaminB3", "VitaminB6", "VitaminB9",
"VitaminB12", "VitaminC", "VitaminD2", "VitaminD3",
"VitaminE", "VitaminK",
"Warfarin",
"Zafirlukast", "ZincGluconate", "ZincSulphate",
"Ziprasidone", "Zithrin", "Zolpidem", "Zopiclone"

]

# Add this list to prevent common prescription words from matching medicines
# 1. Define words that are common in prescriptions but are NOT medicines
# Add this list to prevent common prescription words from matching medicines
BLACKLIST = ["tab", "tablet", "capsule", "refill", "daily", "patient", "dose", "morning", "night"]

def detect_and_correct_medicine(text_line):
    if not text_line:
        return None

    # Clean the text but keep spaces
    clean_text = ''.join(e for e in text_line if e.isalnum() or e.isspace())
    words = clean_text.split()
    
    for word in words:
        word_lower = word.lower()

        # 🛑 LAYER 1: Ignore very short words and common non-medicine terms
        if len(word_lower) < 4 or word_lower in BLACKLIST:
            continue
            
        # 🛑 LAYER 2: Ensure the word contains mostly letters 
        # (Prevents strings like '100mg' from matching 'Morphine')
        if not any(char.isalpha() for char in word_lower):
            continue

        db_lower = [m.lower() for m in MEDICINE_DB]
        
        # 🛑 LAYER 3: Increase strictness (Cutoff 0.7 instead of 0.5)
        # This requires a 70% character match to be accepted
        matches = difflib.get_close_matches(word_lower, db_lower, n=1, cutoff=0.55)
        
        if matches:
            match_lower = matches[0]
            original_name = MEDICINE_DB[db_lower.index(match_lower)]
            
            # 🛑 LAYER 4: Length Difference Check
            # Prevents 'John' matching 'Morphine' (Difference is too big)
            if abs(len(word_lower) - len(match_lower)) > 3:
                continue

            print(f"💊 Medicine Detected: '{word}' -> Corrected to '{original_name}'")
            return original_name

    return None


import re

def classify_medical_item(text):
    """
    PHASE 4: Classify the type of medical item.
    Input: "Tab Paracetamol 500mg"
    Output: "Tablet"
    """
    text_lower = text.lower()
    
    # 1. TABLETS (Tab, Tabs, Tablet)
    if re.search(r'\b(tab|tabs|tablet|tablets)\b', text_lower):
        return "Tablet"
    
    # 2. CAPSULES (Cap, Caps, Capsule)
    if re.search(r'\b(cap|caps|capsule|capsules)\b', text_lower):
        return "Capsule"
    
    # 3. SYRUPS (Syr, Syrup, Susp, Suspension, Liq)
    if re.search(r'\b(syr|syrup|susp|suspension|liq|liquid)\b', text_lower):
        return "Syrup"
    
    # 4. INJECTIONS (Inj, Injection, Vial, Amp)
    if re.search(r'\b(inj|injection|vial|amp)\b', text_lower):
        return "Injection"
    
    # 5. CREAMS/OINTMENTS (Gel, Cream, Oint)
    if re.search(r'\b(gel|cream|oint|ointment)\b', text_lower):
        return "Cream/Ointment"
        
    # Default if unsure but we know it's a medicine
    return "Medicine"
# ✅ Import the new info feature
from features.medicine_info import get_medicine_description

def generate_downloadable_report(detected_data):
    """
    PHASE 6 (Enhanced): Converts JSON into a detailed text report with medicine info.
    """
    lines = []
    lines.append("******************************************")
    lines.append("       MEDICAL PRESCRIPTION REPORT        ")
    lines.append("******************************************")
    lines.append("")
    
    if not detected_data:
        lines.append("No text detected.")
        return "\n".join(lines)

    for i, item in enumerate(detected_data):
        # 1. Get the display text
        name = item.get('medicine_name') or item.get('text')
        
        # 2. If it's a medicine, show detailed info
        if item.get('is_medicine'):
            summary = item.get('summary', '')
            
            # Fetch the new description
            description = get_medicine_description(name)
            
            # Format: 
            # 1. Tablet Paracetamol (500mg) - Take twice daily
            #    Info: Common painkiller used to treat aches...
            lines.append(f"{i+1}. {summary}")
            lines.append(f"    ℹ️  INFO: {description}")
            lines.append("") # Empty line for cleaner spacing
            
        else:
            # 3. Non-medicine text
            lines.append(f"{i+1}. [Note] {name}")
            lines.append("")

    lines.append("******************************************")
   
    
    return "\n".join(lines)
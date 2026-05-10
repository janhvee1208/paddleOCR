# 🩺 Intelligent Prescription Scanner
> Final Year Project | B.E. Computer Science & Engineering, JDIET Yavatmal | 2025–26

An AI-powered system that digitizes handwritten doctor prescriptions using OCR and NLP, extracting structured data (medicine name, dosage, frequency) to reduce medical errors at pharmacy counters.

---

## 🔍 Problem Statement

Approximately **5% of global medical errors** are caused by prescription misinterpretation. Illegible handwriting creates a "translation bottleneck" — pharmacists struggle to decipher unique writing styles and are forced to contact doctors for verification, wasting time and risking patient safety.

**LASA Risk:** Look-Alike, Sound-Alike medications (e.g., Zantac vs. Zyrtec) cause dangerous confusion when handwriting is unclear.

---

## ✅ Solution

A full-stack intelligent pipeline that:
- Scans handwritten prescription images (JPG / PNG / JPEG)
- Extracts text using **PaddleOCR** (CNN + LSTM architecture)
- Classifies extracted entities using **NLP-based Named Entity Recognition (NER)**
- Validates drug names using **Fuzzy Logic** against a verified pharmaceutical database
- Displays structured, machine-readable output via a **React.js** web interface

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| OCR Engine | PaddleOCR (CNN + LSTM) |
| Image Preprocessing | Grayscale, Gaussian Noise Reduction, Binarization, Skew Correction |
| NLP / NER | Python NLP pipeline — Drug Name, Dosage, Frequency extraction |
| Validation | Fuzzy Logic matching against Medicine Database |
| Backend | Python, Flask |
| Frontend | React.js |
| Database | Medicine_Details.csv / MySQL |
| Training | Custom fine-tuning via `custom_finetune.yml` |

---

## 🏗️ System Architecture

```
Input Image (JPG/PNG)
        ↓
Preprocessing Layer
(Grayscale → Noise Reduction → Binarization → Skew Correction)
        ↓
Deep Learning Layer — PaddleOCR
(CNN extracts visual features → LSTM interprets sequential characters)
        ↓
NLP & NER Layer
(Classifies text → Drug Name | Dosage | Frequency)
        ↓
Validation Layer
(Fuzzy Logic matches against Medicine Database → corrects OCR errors)
        ↓
Structured JSON Output → React.js Web Interface
```

---

## 📁 Project Structure

```
paddle-ocr/
├── app.py                              # Flask backend & API routes
├── train.py                            # PaddleOCR custom fine-tuning script
├── custom_finetune.yml                 # Fine-tuning configuration
├── load_medicine_data.py               # Medicine database loader
├── Medicine_Details.csv                # Pharmaceutical reference database
├── medicine_uses_detailed_ocr_dataset.csv  # OCR training dataset
├── medicines.txt                       # Medicine name list for validation
├── metadata.csv                        # Dataset metadata
├── requirements.txt                    # Python dependencies
├── ocr-frontend/                       # React.js frontend application
├── models/                             # Trained OCR model files
├── features/                           # NER & NLP feature modules
├── ppocr_utils/                        # PaddleOCR utility functions
└── .output/rec/best_model/             # Best fine-tuned model checkpoint
```

---

## 🚀 How to Run

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/janhvee1208/paddle-ocr.git
cd paddle-ocr

# Install dependencies
pip install -r requirements.txt

# Load medicine database
python load_medicine_data.py

# Start the Flask server
python app.py
```

### Frontend Setup
```bash
cd ocr-frontend
npm install
npm start
```

The app will be available at `http://localhost:3000`

---

## 📸 How It Works

1. **Upload** a handwritten prescription image via the web interface
2. The image is **preprocessed** (noise removal, skew correction)
3. **PaddleOCR** extracts raw text from the image
4. **NLP/NER** classifies the text into medicine name, dosage, and frequency
5. **Fuzzy Logic** validates and corrects drug names against the database
6. A **structured JSON** result is displayed to the pharmacist/patient

---

## 🎯 Key Features

- ✅ Supports JPG, PNG, JPEG prescription images
- ✅ Handles cursive and unconstrained handwriting styles
- ✅ Prevents LASA (Look-Alike Sound-Alike) drug name errors
- ✅ Real-time scanning via browser — desktop & mobile compatible
- ✅ Outputs structured JSON (medicine name, dosage, frequency)
- ✅ Fine-tuned OCR model for medical handwriting

---

## 📊 Scope

| Parameter | Detail |
|-----------|--------|
| Language | English-language prescriptions |
| Image Formats | JPG, PNG, JPEG |
| Medication Types | Tablets, capsules, liquid medications |
| Target Users | Pharmacists and patients |
| Platform | Desktop and mobile browsers |

---

## 📚 Literature References

1. S. Sharjeel and M. U. Arif, "AI-Based OCR System for Handwritten Medical Prescription Recognition" — *Indian Journal of Computer Science and Technology*, 2025
2. P. Pavithiran et al., "Doctor's Handwritten Prescription Recognition System in Multi-Language" — *Int. Conf. Computer Science and Engineering*, 2023
3. S. Samson et al., "Analysis of Scanned Medical Prescription using Machine Learning" — *IJISRT*, 2024
4. K. U. P. Kanisshka et al., "Intelligent Medical Prescription Analysis Using EasyOCR and NER" — *IJNRD*, 2024
5. N. Ramaraj et al., "Patient Medical Report Analyser" — *International Journal of Advanced Computing Research*, 2024

---

## 👥 Team — Group R6

| Name | Role |
|------|------|
| Janhvee V. Boratkar | NLP / NER Pipeline, Frontend Integration |
| Shivam B. Shete | OCR Engine, Model Fine-tuning |
| Tanmayi A. Dubey | Backend, Database |
| Krutika A. Tatad | Preprocessing, Validation Layer |

**Project Guide:** Prof. A.K. Dhakade
**Institution:** Jawaharlal Darda Institute of Engineering & Technology, Yavatmal (M.S.), India

---

## 📄 License

This project was developed for academic purposes as part of the B.E. Computer Science & Engineering program at JDIET Yavatmal, Session 2025–26.

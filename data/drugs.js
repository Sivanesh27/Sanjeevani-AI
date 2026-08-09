const DRUGS_DATA = [
  {
    "id": "paracetamol",
    "generic": "Paracetamol",
    "brands": [
      "Dolo 650",
      "Crocin",
      "Calpol"
    ],
    "category": "Analgesic / Antipyretic",
    "hi": "पैरासिटामोल",
    "ta": "பாராசிட்டமால்",
    "icon": "💊"
  },
  {
    "id": "aspirin",
    "generic": "Aspirin",
    "brands": [
      "Ecosprin",
      "Disprin"
    ],
    "category": "Antiplatelet / NSAID",
    "hi": "एस्पिरिन",
    "ta": "ஆஸ்பிரின்",
    "icon": "💊"
  },
  {
    "id": "ibuprofen",
    "generic": "Ibuprofen",
    "brands": [
      "Brufen",
      "Combiflam"
    ],
    "category": "NSAID",
    "hi": "आइबुप्रोफेन",
    "ta": "ஐபுப்ரோஃபென்",
    "icon": "💊"
  },
  {
    "id": "diclofenac",
    "generic": "Diclofenac",
    "brands": [
      "Voveran"
    ],
    "category": "NSAID",
    "hi": "डाइक्लोफेनाक",
    "ta": "டைக்ளோஃபெனாக்",
    "icon": "💊"
  },
  {
    "id": "metformin",
    "generic": "Metformin",
    "brands": [
      "Glycomet",
      "Glucophage"
    ],
    "category": "Antidiabetic (Biguanide)",
    "hi": "मेटफॉर्मिन",
    "ta": "மெட்ஃபார்மின்",
    "icon": "🩸"
  },
  {
    "id": "glimepiride",
    "generic": "Glimepiride",
    "brands": [
      "Amaryl"
    ],
    "category": "Antidiabetic (Sulfonylurea)",
    "hi": "ग्लिमेपिराइड",
    "ta": "க்ளிமெபிரைடு",
    "icon": "🩸"
  },
  {
    "id": "insulin",
    "generic": "Insulin",
    "brands": [
      "Human Mixtard",
      "Lantus"
    ],
    "category": "Antidiabetic (Injectable)",
    "hi": "इंसुलिन",
    "ta": "இன்சுலின்",
    "icon": "🩸"
  },
  {
    "id": "enalapril",
    "generic": "Enalapril",
    "brands": [
      "Envas"
    ],
    "category": "ACE Inhibitor",
    "hi": "एनालाप्रिल",
    "ta": "எனலாப்ரில்",
    "icon": "❤️"
  },
  {
    "id": "ramipril",
    "generic": "Ramipril",
    "brands": [
      "Cardace"
    ],
    "category": "ACE Inhibitor",
    "hi": "रामिप्रिल",
    "ta": "ராமிப்ரில்",
    "icon": "❤️"
  },
  {
    "id": "amlodipine",
    "generic": "Amlodipine",
    "brands": [
      "Amlong",
      "Amlopres"
    ],
    "category": "Calcium Channel Blocker",
    "hi": "एम्लोडिपिन",
    "ta": "அம்லோடிபின்",
    "icon": "❤️"
  },
  {
    "id": "spironolactone",
    "generic": "Spironolactone",
    "brands": [
      "Aldactone"
    ],
    "category": "Potassium-sparing Diuretic",
    "hi": "स्पिरोनोलैक्टोन",
    "ta": "ஸ்பைரோனோலாக்டோன்",
    "icon": "❤️"
  },
  {
    "id": "furosemide",
    "generic": "Furosemide",
    "brands": [
      "Lasix"
    ],
    "category": "Loop Diuretic",
    "hi": "फ्यूरोसेमाइड",
    "ta": "ஃபியூரோசெமைடு",
    "icon": "❤️"
  },
  {
    "id": "digoxin",
    "generic": "Digoxin",
    "brands": [
      "Lanoxin"
    ],
    "category": "Cardiac Glycoside",
    "hi": "डिगॉक्सिन",
    "ta": "டிகாக்சின்",
    "icon": "❤️"
  },
  {
    "id": "atorvastatin",
    "generic": "Atorvastatin",
    "brands": [
      "Atorva",
      "Storvas"
    ],
    "category": "Statin",
    "hi": "एटोरवास्टेटिन",
    "ta": "அடோர்வாஸ்டாடின்",
    "icon": "❤️"
  },
  {
    "id": "simvastatin",
    "generic": "Simvastatin",
    "brands": [
      "Simvotin"
    ],
    "category": "Statin",
    "hi": "सिमवास्टेटिन",
    "ta": "சிம்வாஸ்டாடின்",
    "icon": "❤️"
  },
  {
    "id": "clopidogrel",
    "generic": "Clopidogrel",
    "brands": [
      "Clopilet"
    ],
    "category": "Antiplatelet",
    "hi": "क्लोपिडोग्रेल",
    "ta": "க்ளோபிடோகிரெல்",
    "icon": "❤️"
  },
  {
    "id": "warfarin",
    "generic": "Warfarin",
    "brands": [
      "Sofarin"
    ],
    "category": "Anticoagulant",
    "hi": "वारफारिन",
    "ta": "வார்ஃபரின்",
    "icon": "🩸"
  },
  {
    "id": "omeprazole",
    "generic": "Omeprazole",
    "brands": [
      "Omez"
    ],
    "category": "Proton Pump Inhibitor",
    "hi": "ओमेप्राज़ोल",
    "ta": "ஓமிப்ராசோல்",
    "icon": "🍽️"
  },
  {
    "id": "levothyroxine",
    "generic": "Levothyroxine",
    "brands": [
      "Eltroxin",
      "Thyronorm"
    ],
    "category": "Thyroid Hormone",
    "hi": "लेवोथायरोक्सिन",
    "ta": "லெவோதைராக்சின்",
    "icon": "🦋"
  },
  {
    "id": "calcium",
    "generic": "Calcium Carbonate",
    "brands": [
      "Shelcal"
    ],
    "category": "Supplement",
    "hi": "कैल्शियम कार्बोनेट",
    "ta": "கால்சியம் கார்பனேட்",
    "icon": "🦴"
  },
  {
    "id": "ciprofloxacin",
    "generic": "Ciprofloxacin",
    "brands": [
      "Cifran"
    ],
    "category": "Antibiotic (Fluoroquinolone)",
    "hi": "सिप्रोफ्लोक्सासिन",
    "ta": "சிப்ரோஃப்ளாக்சசின்",
    "icon": "🦠"
  },
  {
    "id": "azithromycin",
    "generic": "Azithromycin",
    "brands": [
      "Azithral"
    ],
    "category": "Antibiotic (Macrolide)",
    "hi": "एज़िथ्रोमाइसिन",
    "ta": "அசித்ரோமைசின்",
    "icon": "🦠"
  },
  {
    "id": "clarithromycin",
    "generic": "Clarithromycin",
    "brands": [
      "Claribid"
    ],
    "category": "Antibiotic (Macrolide)",
    "hi": "क्लैरिथ्रोमाइसिन",
    "ta": "கிளாரித்ரோமைசின்",
    "icon": "🦠"
  },
  {
    "id": "metronidazole",
    "generic": "Metronidazole",
    "brands": [
      "Flagyl"
    ],
    "category": "Antibiotic / Antiprotozoal",
    "hi": "मेट्रोनिडाज़ोल",
    "ta": "மெட்ரோனிடசோல்",
    "icon": "🦠"
  },
  {
    "id": "sertraline",
    "generic": "Sertraline",
    "brands": [
      "Zoloft"
    ],
    "category": "SSRI Antidepressant",
    "hi": "सर्ट्रालाइन",
    "ta": "செர்ட்ரலைன்",
    "icon": "🧠"
  },
  {
    "id": "fluoxetine",
    "generic": "Fluoxetine",
    "brands": [
      "Prozac"
    ],
    "category": "SSRI Antidepressant",
    "hi": "फ्लुओक्सेटीन",
    "ta": "புளூக்செடின்",
    "icon": "🧠"
  },
  {
    "id": "tramadol",
    "generic": "Tramadol",
    "brands": [
      "Ultracet"
    ],
    "category": "Opioid Analgesic",
    "hi": "ट्रामाडोल",
    "ta": "ட்ராமடோல்",
    "icon": "💊"
  },
  {
    "id": "sildenafil",
    "generic": "Sildenafil",
    "brands": [
      "Viagra",
      "Suhagra"
    ],
    "category": "PDE5 Inhibitor",
    "hi": "सिल्डेनाफिल",
    "ta": "சில்டெனாஃபில்",
    "icon": "❤️"
  },
  {
    "id": "isosorbide",
    "generic": "Isosorbide Dinitrate",
    "brands": [
      "Sorbitrate"
    ],
    "category": "Nitrate (Anti-anginal)",
    "hi": "आइसोसोर्बाइड",
    "ta": "ஐசோசார்பைடு",
    "icon": "❤️"
  },
  {
    "id": "propranolol",
    "generic": "Propranolol",
    "brands": [
      "Ciplar"
    ],
    "category": "Beta Blocker",
    "hi": "प्रोप्रानोलोल",
    "ta": "புரோப்ரானொலால்",
    "icon": "❤️"
  },
  {
    "id": "ginkgo",
    "generic": "Ginkgo Biloba",
    "brands": [
      "Herbal Supplement"
    ],
    "category": "Herbal Supplement",
    "hi": "जिन्कगो बिलोबा",
    "ta": "ஜிங்கோ பிலோபா",
    "icon": "🌿"
  }
];

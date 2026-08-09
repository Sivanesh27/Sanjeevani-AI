const INTERACTIONS_DATA = [
  {
    "pair": [
      "warfarin",
      "aspirin"
    ],
    "severity": "severe",
    "title": {
      "en": "Major bleeding risk",
      "hi": "गंभीर रक्तस्राव का खतरा",
      "ta": "கடுமையான இரத்தப்போக்கு அபாயம்"
    },
    "explain": {
      "en": "Both thin the blood. Taking them together sharply raises the risk of internal or external bleeding.",
      "hi": "दोनों दवाएं खून को पतला करती हैं। साथ लेने से रक्तस्राव का खतरा काफी बढ़ जाता है।",
      "ta": "இரண்டும் இரத்தத்தை மெலிதாக்குகின்றன. இணைந்து எடுத்தால் இரத்தப்போக்கு அபாயம் அதிகரிக்கும்."
    },
    "advice": {
      "en": "Do not combine without a doctor's supervision and INR monitoring.",
      "hi": "डॉक्टर की निगरानी और INR जांच के बिना एक साथ न लें।",
      "ta": "மருத்துவரின் மேற்பார்வை இல்லாமல் இணைத்து எடுக்க வேண்டாம்."
    }
  },
  {
    "pair": [
      "ramipril",
      "spironolactone"
    ],
    "severity": "severe",
    "title": {
      "en": "Dangerous potassium rise (hyperkalemia)",
      "hi": "पोटैशियम का खतरनाक स्तर तक बढ़ना",
      "ta": "ஆபத்தான பொட்டாசியம் அதிகரிப்பு"
    },
    "explain": {
      "en": "ACE inhibitors and potassium-sparing diuretics both raise blood potassium — together this can cause dangerous heart rhythm problems.",
      "hi": "यह संयोजन रक्त में पोटैशियम को खतरनाक स्तर तक बढ़ा सकता है, जिससे हृदय गति में समस्या हो सकती है।",
      "ta": "இந்த கலவை இரத்த பொட்டாசியத்தை ஆபத்தான அளவிற்கு உயர்த்தலாம், இதனால் இதய தாள பிரச்சனை ஏற்படலாம்."
    },
    "advice": {
      "en": "Needs regular potassium/kidney function monitoring by a doctor.",
      "hi": "डॉक्टर द्वारा नियमित पोटैशियम और किडनी जांच आवश्यक है।",
      "ta": "மருத்துவரால் தொடர்ந்து பொட்டாசியம் பரிசோதனை தேவை."
    }
  },
  {
    "pair": [
      "simvastatin",
      "clarithromycin"
    ],
    "severity": "severe",
    "title": {
      "en": "Muscle damage risk (rhabdomyolysis)",
      "hi": "मांसपेशी क्षति का खतरा",
      "ta": "தசை சேத அபாயம்"
    },
    "explain": {
      "en": "This antibiotic raises statin levels in the blood, increasing the risk of severe muscle breakdown.",
      "hi": "यह एंटीबायोटिक स्टैटिन का स्तर बढ़ा देता है, जिससे मांसपेशी टूटने का खतरा बढ़ जाता है।",
      "ta": "இந்த ஆண்டிபயாடிக் ஸ்டேடின் அளவை உயர்த்தி, தசை சேத அபாயத்தை அதிகரிக்கும்."
    },
    "advice": {
      "en": "Ask the pharmacist about a safer alternative antibiotic.",
      "hi": "फार्मासिस्ट से सुरक्षित एंटीबायोटिक विकल्प के बारे में पूछें।",
      "ta": "பாதுகாப்பான மாற்று ஆண்டிபயாடிக் பற்றி மருந்தாளரிடம் கேளுங்கள்."
    }
  },
  {
    "pair": [
      "digoxin",
      "furosemide"
    ],
    "severity": "severe",
    "title": {
      "en": "Digoxin toxicity risk",
      "hi": "डिगॉक्सिन विषाक्तता का खतरा",
      "ta": "டிகாக்சின் நச்சுத்தன்மை அபாயம்"
    },
    "explain": {
      "en": "This diuretic can lower potassium, which makes digoxin more toxic to the heart.",
      "hi": "यह मूत्रवर्धक पोटैशियम कम करता है, जिससे डिगॉक्सिन हृदय के लिए अधिक विषैला हो जाता है।",
      "ta": "இந்த மூத்திரவிரிவி பொட்டாசியத்தை குறைக்கும், இதனால் டிகாக்சின் இதயத்திற்கு அதிக நச்சுத்தன்மை அடையும்."
    },
    "advice": {
      "en": "Regular potassium and digoxin level checks are essential.",
      "hi": "नियमित पोटैशियम और डिगॉक्सिन स्तर जांच आवश्यक है।",
      "ta": "தொடர்ந்து பொட்டாசியம் மற்றும் டிகாக்சின் அளவு பரிசோதனை அவசியம்."
    }
  },
  {
    "pair": [
      "sildenafil",
      "isosorbide"
    ],
    "severity": "severe",
    "title": {
      "en": "Severe, life-threatening low blood pressure",
      "hi": "जानलेवा रूप से रक्तचाप गिरना",
      "ta": "உயிருக்கு ஆபத்தான குறைந்த இரத்த அழுத்தம்"
    },
    "explain": {
      "en": "This combination can cause a sudden, severe drop in blood pressure. It should never be combined.",
      "hi": "यह संयोजन रक्तचाप में अचानक भारी गिरावट ला सकता है। इन्हें कभी साथ न लें।",
      "ta": "இந்த கலவை இரத்த அழுத்தத்தை திடீரென கடுமையாக குறைக்கலாம். ஒருபோதும் இணைக்க வேண்டாம்."
    },
    "advice": {
      "en": "Contraindicated — flag for immediate pharmacist/doctor review.",
      "hi": "यह संयोजन वर्जित है — तुरंत डॉक्टर से संपर्क करें।",
      "ta": "இது தடைசெய்யப்பட்டது — உடனடியாக மருத்துவரை அணுகவும்."
    }
  },
  {
    "pair": [
      "tramadol",
      "sertraline"
    ],
    "severity": "severe",
    "title": {
      "en": "Serotonin syndrome risk",
      "hi": "सेरोटोनिन सिंड्रोम का खतरा",
      "ta": "செரோடோனின் நோய்க்கூட்டு அபாயம்"
    },
    "explain": {
      "en": "Both raise serotonin activity. Together they can cause agitation, high fever, and a dangerous reaction.",
      "hi": "दोनों सेरोटोनिन बढ़ाते हैं। साथ लेने से बेचैनी, तेज़ बुखार और खतरनाक प्रतिक्रिया हो सकती है।",
      "ta": "இரண்டும் செரோடோனினை அதிகரிக்கும். இணைந்தால் அமைதியின்மை, அதிக காய்ச்சல் ஏற்படலாம்."
    },
    "advice": {
      "en": "Flag for doctor review before continuing both.",
      "hi": "दोनों जारी रखने से पहले डॉक्टर से सलाह लें।",
      "ta": "தொடர்வதற்கு முன் மருத்துவரிடம் ஆலோசிக்கவும்."
    }
  },
  {
    "pair": [
      "tramadol",
      "fluoxetine"
    ],
    "severity": "severe",
    "title": {
      "en": "Serotonin syndrome risk",
      "hi": "सेरोटोनिन सिंड्रोम का खतरा",
      "ta": "செரோடோனின் நோய்க்கூட்டு அபாயம்"
    },
    "explain": {
      "en": "Both raise serotonin activity, increasing risk of a dangerous reaction when combined.",
      "hi": "दोनों सेरोटोनिन बढ़ाते हैं, साथ लेने पर खतरनाक प्रतिक्रिया का खतरा बढ़ता है।",
      "ta": "இரண்டும் செரோடோனினை அதிகரிக்கும், இணைந்தால் ஆபத்தான எதிர்வினை அபாயம் அதிகரிக்கும்."
    },
    "advice": {
      "en": "Flag for doctor review before continuing both.",
      "hi": "दोनों जारी रखने से पहले डॉक्टर से सलाह लें।",
      "ta": "தொடர்வதற்கு முன் மருத்துவரிடம் ஆலோசிக்கவும்."
    }
  },
  {
    "pair": [
      "metronidazole",
      "warfarin"
    ],
    "severity": "moderate",
    "title": {
      "en": "Increased bleeding risk",
      "hi": "रक्तस्राव का बढ़ा जोखिम",
      "ta": "இரத்தப்போக்கு அபாய அதிகரிப்பு"
    },
    "explain": {
      "en": "This antibiotic can strengthen warfarin's blood-thinning effect.",
      "hi": "यह एंटीबायोटिक वारफारिन के प्रभाव को बढ़ा सकता है।",
      "ta": "இந்த ஆண்டிபயாடிக் வார்ஃபரின் விளைவை அதிகரிக்கலாம்."
    },
    "advice": {
      "en": "Doctor may need to adjust the warfarin dose temporarily.",
      "hi": "डॉक्टर को अस्थायी रूप से खुराक बदलनी पड़ सकती है।",
      "ta": "மருத்துவர் தற்காலிகமாக அளவை மாற்ற வேண்டியிருக்கலாம்."
    }
  },
  {
    "pair": [
      "clopidogrel",
      "omeprazole"
    ],
    "severity": "moderate",
    "title": {
      "en": "Reduced antiplatelet effect",
      "hi": "एंटीप्लेटलेट प्रभाव में कमी",
      "ta": "ஆன்டிபிளேட்லெட் விளைவு குறைவு"
    },
    "explain": {
      "en": "Omeprazole can reduce how well clopidogrel prevents blood clots.",
      "hi": "ओमेप्राज़ोल क्लोपिडोग्रेल के थक्का-रोधी प्रभाव को कम कर सकता है।",
      "ta": "ஓமிப்ராசோல் க்ளோபிடோகிரெலின் விளைவை குறைக்கலாம்."
    },
    "advice": {
      "en": "Ask about an alternative PPI (e.g., pantoprazole).",
      "hi": "वैकल्पिक PPI (जैसे पैंटोप्राज़ोल) के बारे में पूछें।",
      "ta": "மாற்று PPI பற்றி கேளுங்கள்."
    }
  },
  {
    "pair": [
      "diclofenac",
      "ramipril"
    ],
    "severity": "moderate",
    "title": {
      "en": "Reduced blood pressure control + kidney strain",
      "hi": "रक्तचाप नियंत्रण में कमी और किडनी पर असर",
      "ta": "இரத்த அழுத்த கட்டுப்பாடு குறைவு மற்றும் சிறுநீரக அழுத்தம்"
    },
    "explain": {
      "en": "NSAIDs can blunt the blood-pressure-lowering effect of ACE inhibitors and stress the kidneys.",
      "hi": "NSAID दवाएं रक्तचाप कम करने वाली दवा के असर को कम कर सकती हैं और किडनी पर दबाव डालती हैं।",
      "ta": "NSAID மருந்துகள் இரத்த அழுத்த மருந்தின் விளைவை குறைத்து சிறுநீரகத்தை பாதிக்கலாம்."
    },
    "advice": {
      "en": "Use short-term only; monitor blood pressure and kidney function.",
      "hi": "केवल थोड़े समय के लिए उपयोग करें; रक्तचाप और किडनी की निगरानी करें।",
      "ta": "குறுகிய காலத்திற்கு மட்டும் பயன்படுத்தவும்; கண்காணிக்கவும்."
    }
  },
  {
    "pair": [
      "ibuprofen",
      "aspirin"
    ],
    "severity": "moderate",
    "title": {
      "en": "Increased stomach bleeding risk",
      "hi": "पेट में रक्तस्राव का बढ़ा खतरा",
      "ta": "வயிற்று இரத்தப்போக்கு அபாயம் அதிகரிப்பு"
    },
    "explain": {
      "en": "Both irritate the stomach lining; together the risk of ulcers or bleeding rises. Ibuprofen can also blunt aspirin's heart-protective effect.",
      "hi": "दोनों पेट की परत को नुकसान पहुंचाते हैं; साथ में अल्सर या रक्तस्राव का खतरा बढ़ता है।",
      "ta": "இரண்டும் வயிற்றுச் சுவரை பாதிக்கும்; இணைந்தால் புண் அல்லது இரத்தப்போக்கு அபாயம் அதிகரிக்கும்."
    },
    "advice": {
      "en": "Avoid regular combined use; take with food and consult a pharmacist.",
      "hi": "नियमित रूप से एक साथ न लें; भोजन के साथ लें और फार्मासिस्ट से सलाह लें।",
      "ta": "தொடர்ந்து இணைந்து எடுக்க வேண்டாம்; உணவுடன் எடுக்கவும்."
    }
  },
  {
    "pair": [
      "amlodipine",
      "simvastatin"
    ],
    "severity": "moderate",
    "title": {
      "en": "Higher statin levels — muscle risk",
      "hi": "स्टैटिन स्तर बढ़ना — मांसपेशी जोखिम",
      "ta": "ஸ்டேடின் அளவு அதிகரிப்பு — தசை அபாயம்"
    },
    "explain": {
      "en": "Amlodipine can raise simvastatin blood levels, increasing the chance of muscle pain or damage at higher statin doses.",
      "hi": "एम्लोडिपिन सिमवास्टेटिन का स्तर बढ़ा सकता है, जिससे मांसपेशी दर्द का खतरा बढ़ता है।",
      "ta": "அம்லோடிபின் சிம்வாஸ்டாடின் அளவை உயர்த்தி தசை வலி அபாயத்தை அதிகரிக்கலாம்."
    },
    "advice": {
      "en": "Simvastatin dose above 20mg is usually avoided with amlodipine — check with pharmacist.",
      "hi": "एम्लोडिपिन के साथ सिमवास्टेटिन की अधिक खुराक से बचें — फार्मासिस्ट से पूछें।",
      "ta": "அதிக அளவு சிம்வாஸ்டாடினை தவிர்க்கவும் — மருந்தாளரிடம் கேளுங்கள்."
    }
  },
  {
    "pair": [
      "propranolol",
      "insulin"
    ],
    "severity": "moderate",
    "title": {
      "en": "Masked low blood sugar symptoms",
      "hi": "कम ब्लड शुगर के लक्षण छिपना",
      "ta": "குறைந்த சர்க்கரை அறிகுறிகள் மறைதல்"
    },
    "explain": {
      "en": "Beta blockers can hide the warning signs of hypoglycemia (shaking, fast heartbeat), delaying treatment.",
      "hi": "बीटा ब्लॉकर हाइपोग्लाइसीमिया के चेतावनी संकेतों को छिपा सकते हैं।",
      "ta": "பீட்டா தடுப்பான்கள் இரத்த சர்க்கரை குறைவு அறிகுறிகளை மறைக்கலாம்."
    },
    "advice": {
      "en": "Check blood sugar regularly instead of relying on symptoms.",
      "hi": "लक्षणों पर निर्भर रहने के बजाय नियमित रूप से शुगर जांचें।",
      "ta": "அறிகுறிகளை நம்பாமல் தொடர்ந்து சர்க்கரையை பரிசோதிக்கவும்."
    }
  },
  {
    "pair": [
      "ciprofloxacin",
      "calcium"
    ],
    "severity": "mild",
    "title": {
      "en": "Reduced antibiotic absorption",
      "hi": "एंटीबायोटिक अवशोषण में कमी",
      "ta": "ஆண்டிபயாடிக் உறிஞ்சுதல் குறைவு"
    },
    "explain": {
      "en": "Calcium binds to this antibiotic in the gut and reduces how much is absorbed.",
      "hi": "कैल्शियम इस एंटीबायोटिक से बंध जाता है और अवशोषण कम कर देता है।",
      "ta": "கால்சியம் ஆண்டிபயாடிக்குடன் இணைந்து உறிஞ்சுதலை குறைக்கும்."
    },
    "advice": {
      "en": "Space doses at least 2 hours apart.",
      "hi": "दोनों खुराकों के बीच कम से कम 2 घंटे का अंतर रखें।",
      "ta": "இரண்டு மருந்துகளுக்கும் இடையே குறைந்தது 2 மணி நேரம் இடைவெளி வையுங்கள்."
    }
  },
  {
    "pair": [
      "levothyroxine",
      "calcium"
    ],
    "severity": "mild",
    "title": {
      "en": "Reduced thyroid hormone absorption",
      "hi": "थायरॉइड हार्मोन अवशोषण में कमी",
      "ta": "தைராய்டு ஹார்மோன் உறிஞ்சுதல் குறைவு"
    },
    "explain": {
      "en": "Calcium can bind levothyroxine in the gut, lowering how much the body absorbs.",
      "hi": "कैल्शियम आंत में लेवोथायरोक्सिन से बंध सकता है, जिससे अवशोषण कम हो जाता है।",
      "ta": "கால்சியம் லெவோதைராக்சினுடன் இணைந்து உறிஞ்சுதலை குறைக்கலாம்."
    },
    "advice": {
      "en": "Take levothyroxine on an empty stomach, at least 4 hours before calcium.",
      "hi": "लेवोथायरोक्सिन खाली पेट लें, कैल्शियम से कम से कम 4 घंटे पहले।",
      "ta": "லெவோதைராக்சினை வெறும் வயிற்றில் எடுக்கவும், கால்சியத்திற்கு 4 மணி நேரம் முன்பு."
    }
  },
  {
    "pair": [
      "warfarin",
      "ginkgo"
    ],
    "severity": "moderate",
    "title": {
      "en": "Increased bleeding risk (herbal interaction)",
      "hi": "रक्तस्राव का बढ़ा जोखिम (हर्बल परस्पर क्रिया)",
      "ta": "இரத்தப்போக்கு அபாயம் அதிகரிப்பு (மூலிகை தொடர்பு)"
    },
    "explain": {
      "en": "Ginkgo has mild blood-thinning properties of its own and can add to warfarin's effect.",
      "hi": "जिन्कगो में स्वयं भी हल्का रक्त पतला करने वाला गुण होता है, जो वारफारिन के प्रभाव को बढ़ा सकता है।",
      "ta": "ஜிங்கோவிற்கும் சொந்தமாக லேசான இரத்த மெலிதாக்கும் தன்மை உள்ளது."
    },
    "advice": {
      "en": "Disclose all herbal supplements to your doctor before combining.",
      "hi": "किसी भी हर्बल सप्लीमेंट के बारे में डॉक्टर को अवश्य बताएं।",
      "ta": "மூலிகை மருந்துகளை மருத்துவரிடம் தெரிவிக்கவும்."
    }
  }
];

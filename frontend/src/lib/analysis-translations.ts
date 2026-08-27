import type { Language } from "@/lib/language-context";

type Translation = Record<Language, string>;

const TEXT: Record<string, Translation> = {
  "Analysis Result": {
    en: "Analysis Result",
    hi: "विश्लेषण परिणाम",
    pa: "ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ",
    mr: "विश्लेषण निकाल",
  },
  "Confidence": {
    en: "Confidence",
    hi: "विश्वास स्तर",
    pa: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
    mr: "विश्वास पातळी",
  },
  "Risk unavailable": {
    en: "Risk unavailable",
    hi: "जोखिम उपलब्ध नहीं",
    pa: "ਖਤਰਾ ਉਪਲਬਧ ਨਹੀਂ",
    mr: "धोका उपलब्ध नाही",
  },
  "Risk": {
    en: "Risk",
    hi: "जोखिम",
    pa: "ਖਤਰਾ",
    mr: "धोका",
  },
  "No prediction": {
    en: "No prediction",
    hi: "कोई पूर्वानुमान नहीं",
    pa: "ਕੋਈ ਅਨੁਮਾਨ ਨਹੀਂ",
    mr: "अंदाज उपलब्ध नाही",
  },
  "Prediction status": {
    en: "Prediction status",
    hi: "पूर्वानुमान स्थिति",
    pa: "ਅਨੁਮਾਨ ਸਥਿਤੀ",
    mr: "अंदाज स्थिती",
  },
  "AI prediction generated from uploaded leaf image": {
    en: "AI prediction generated from uploaded leaf image",
    hi: "अपलोड की गई पत्ती की तस्वीर से एआई पूर्वानुमान तैयार किया गया",
    pa: "ਅੱਪਲੋਡ ਕੀਤੀ ਪੱਤੀ ਦੀ ਤਸਵੀਰ ਤੋਂ ਏਆਈ ਅਨੁਮਾਨ ਤਿਆਰ ਕੀਤਾ ਗਿਆ",
    mr: "अपलोड केलेल्या पानाच्या प्रतिमेतून एआय अंदाज तयार केला",
  },
  "Why the AI thinks this": {
    en: "Why the AI thinks this",
    hi: "एआई ने यह निष्कर्ष क्यों निकाला",
    pa: "ਏਆਈ ਨੇ ਇਹ ਨਤੀਜਾ ਕਿਉਂ ਕੱਢਿਆ",
    mr: "एआयने हा निष्कर्ष का काढला",
  },
  "The highlighted region shows which part of the leaf most influenced this diagnosis.": {
    en: "The highlighted region shows which part of the leaf most influenced this diagnosis.",
    hi: "हाइलाइट किया गया भाग दिखाता है कि पत्ती के किस हिस्से ने इस निदान को सबसे अधिक प्रभावित किया।",
    pa: "ਹਾਈਲਾਈਟ ਕੀਤਾ ਹਿੱਸਾ ਦਿਖਾਉਂਦਾ ਹੈ ਕਿ ਪੱਤੀ ਦੇ ਕਿਹੜੇ ਭਾਗ ਨੇ ਇਸ ਨਿਦਾਨ ਨੂੰ ਸਭ ਤੋਂ ਵੱਧ ਪ੍ਰਭਾਵਿਤ ਕੀਤਾ।",
    mr: "ठळक केलेला भाग दाखवतो की पानाच्या कोणत्या भागाचा या निदानावर सर्वाधिक प्रभाव पडला.",
  },
  "Weather unavailable": {
    en: "Weather unavailable",
    hi: "मौसम की जानकारी उपलब्ध नहीं",
    pa: "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਉਪਲਬਧ ਨਹੀਂ",
    mr: "हवामान माहिती उपलब्ध नाही",
  },
  "Humidity": { en: "Humidity", hi: "आर्द्रता", pa: "ਨਮੀ", mr: "आर्द्रता" },
  "Temperature": { en: "Temperature", hi: "तापमान", pa: "ਤਾਪਮਾਨ", mr: "तापमान" },
  "Recommended action": {
    en: "Recommended action",
    hi: "अनुशंसित कार्रवाई",
    pa: "ਸਿਫ਼ਾਰਸ਼ੀ ਕਾਰਵਾਈ",
    mr: "शिफारस केलेली कृती",
  },
  "Complete a scan to receive treatment advice.": {
    en: "Complete a scan to receive treatment advice.",
    hi: "उपचार सलाह पाने के लिए स्कैन पूरा करें।",
    pa: "ਇਲਾਜ ਦੀ ਸਲਾਹ ਲਈ ਸਕੈਨ ਪੂਰਾ ਕਰੋ।",
    mr: "उपचार सल्ल्यासाठी स्कॅन पूर्ण करा.",
  },
  "Weather source": {
    en: "Weather source",
    hi: "मौसम स्रोत",
    pa: "ਮੌਸਮ ਸਰੋਤ",
    mr: "हवामान स्रोत",
  },
  "Soil context": {
    en: "Soil context",
    hi: "मिट्टी का संदर्भ",
    pa: "ਮਿੱਟੀ ਸੰਦਰਭ",
    mr: "माती संदर्भ",
  },
  "soil risk": {
    en: "soil risk",
    hi: "मिट्टी जोखिम",
    pa: "ਮਿੱਟੀ ਖਤਰਾ",
    mr: "मातीचा धोका",
  },
  "Soil type": { en: "Soil type", hi: "मिट्टी का प्रकार", pa: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ", mr: "मातीचा प्रकार" },
  "Moisture": { en: "Moisture", hi: "नमी", pa: "ਨਮੀ", mr: "ओलावा" },
  "Nitrogen": { en: "Nitrogen", hi: "नाइट्रोजन", pa: "ਨਾਈਟ੍ਰੋਜਨ", mr: "नायट्रोजन" },
  "Phosphorus": { en: "Phosphorus", hi: "फॉस्फोरस", pa: "ਫਾਸਫੋਰਸ", mr: "फॉस्फरस" },
  "Potassium": { en: "Potassium", hi: "पोटैशियम", pa: "ਪੋਟਾਸ਼ੀਅਮ", mr: "पोटॅशियम" },
  "Why soil is adding risk": {
    en: "Why soil is adding risk",
    hi: "मिट्टी जोखिम क्यों बढ़ा रही है",
    pa: "ਮਿੱਟੀ ਖਤਰਾ ਕਿਉਂ ਵਧਾ ਰਹੀ ਹੈ",
    mr: "माती धोका का वाढवत आहे",
  },
  "Soil-based recommendations": {
    en: "Soil-based recommendations",
    hi: "मिट्टी आधारित सुझाव",
    pa: "ਮਿੱਟੀ-ਅਧਾਰਿਤ ਸਿਫ਼ਾਰਸ਼ਾਂ",
    mr: "माती-आधारित शिफारसी",
  },
  "Crop Health Memory": {
    en: "Crop Health Memory",
    hi: "फसल स्वास्थ्य रिकॉर्ड",
    pa: "ਫਸਲ ਸਿਹਤ ਰਿਕਾਰਡ",
    mr: "पीक आरोग्य नोंद",
  },
  "View full history": {
    en: "View full history",
    hi: "पूरा इतिहास देखें",
    pa: "ਪੂਰਾ ਇਤਿਹਾਸ ਵੇਖੋ",
    mr: "संपूर्ण इतिहास पहा",
  },
  "Health score for": {
    en: "Health score for",
    hi: "स्वास्थ्य स्कोर",
    pa: "ਸਿਹਤ ਸਕੋਰ",
    mr: "आरोग्य गुण",
  },
  "First scan recorded — history starts now.": {
    en: "First scan recorded — history starts now.",
    hi: "पहला स्कैन दर्ज हो गया — इतिहास अब शुरू होता है।",
    pa: "ਪਹਿਲਾ ਸਕੈਨ ਦਰਜ ਹੋ ਗਿਆ — ਇਤਿਹਾਸ ਹੁਣ ਸ਼ੁਰੂ ਹੁੰਦਾ ਹੈ।",
    mr: "पहिला स्कॅन नोंदवला — इतिहास आता सुरू होतो.",
  },
  "vs last scan": {
    en: "vs last scan",
    hi: "पिछले स्कैन की तुलना में",
    pa: "ਪਿਛਲੇ ਸਕੈਨ ਨਾਲ ਤੁਲਨਾ",
    mr: "मागील स्कॅनच्या तुलनेत",
  },
  "Improving": { en: "Improving", hi: "सुधार हो रहा है", pa: "ਸੁਧਾਰ ਹੋ ਰਿਹਾ ਹੈ", mr: "सुधारत आहे" },
  "Deteriorating": { en: "Deteriorating", hi: "बिगड़ रहा है", pa: "ਖਰਾਬ ਹੋ ਰਿਹਾ ਹੈ", mr: "बिघडत आहे" },
  "Stable": { en: "Stable", hi: "स्थिर", pa: "ਸਥਿਰ", mr: "स्थिर" },
  "points": { en: "pts", hi: "अंक", pa: "ਅੰਕ", mr: "गुण" },
  "Listen": { en: "Listen", hi: "सुनें", pa: "ਸੁਣੋ", mr: "ऐका" },
  "Recovery Plan": { en: "Recovery Plan", hi: "रिकवरी योजना", pa: "ਸੁਧਾਰ ਯੋਜਨਾ", mr: "पुनर्प्राप्ती योजना" },
  "Need more help?": { en: "Need more help?", hi: "और मदद चाहिए?", pa: "ਹੋਰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?", mr: "आणखी मदत हवी आहे?" },
  "Get Help from Bot": { en: "Get Help from Bot", hi: "बॉट से मदद लें", pa: "ਬੌਟ ਤੋਂ ਮਦਦ ਲਵੋ", mr: "बॉटकडून मदत घ्या" },
  "Govt. Schemes": { en: "Govt. Schemes", hi: "सरकारी योजनाएँ", pa: "ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ", mr: "सरकारी योजना" },
  "Low": { en: "Low", hi: "कम", pa: "ਘੱਟ", mr: "कमी" },
  "Medium": { en: "Medium", hi: "मध्यम", pa: "ਦਰਮਿਆਨਾ", mr: "मध्यम" },
  "High": { en: "High", hi: "उच्च", pa: "ਉੱਚ", mr: "उच्च" },
  "Uncertain": { en: "Uncertain", hi: "अनिश्चित", pa: "ਅਨਿਸ਼ਚਿਤ", mr: "अनिश्चित" },
  "Healthy": { en: "Healthy", hi: "स्वस्थ", pa: "ਸਿਹਤਮੰਦ", mr: "निरोगी" },
  "Rain expected": { en: "Rain expected", hi: "बारिश की संभावना", pa: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ", mr: "पावसाची शक्यता" },
  "High wind": { en: "High wind", hi: "तेज़ हवा", pa: "ਤੇਜ਼ ਹਵਾ", mr: "जोराचा वारा" },
  "High humidity": { en: "High humidity", hi: "उच्च आर्द्रता", pa: "ਵੱਧ ਨਮੀ", mr: "जास्त आर्द्रता" },
  "Low weather risk": { en: "Low weather risk", hi: "कम मौसम जोखिम", pa: "ਘੱਟ ਮੌਸਮੀ ਖਤਰਾ", mr: "कमी हवामान धोका" },

  "Recovery plan": { en: "Recovery plan", hi: "रिकवरी योजना", pa: "ਸੁਧਾਰ ਯੋਜਨਾ", mr: "पुनर्प्राप्ती योजना" },
  "Day": { en: "Day", hi: "दिन", pa: "ਦਿਨ", mr: "दिवस" },
  "of your 7-day recovery plan": {
    en: "of your 7-day recovery plan",
    hi: "आपकी 7-दिन की रिकवरी योजना का",
    pa: "ਤੁਹਾਡੀ 7-ਦਿਨਾਂ ਦੀ ਸੁਧਾਰ ਯੋਜਨਾ ਦਾ",
    mr: "तुमच्या 7-दिवसांच्या पुनर्प्राप्ती योजनेतील",
  },
  "complete": { en: "complete", hi: "पूरा", pa: "ਪੂਰਾ", mr: "पूर्ण" },
  "days remaining": { en: "days remaining", hi: "दिन शेष", pa: "ਦਿਨ ਬਾਕੀ", mr: "दिवस बाकी" },
  "Rain expected tonight": {
    en: "Rain expected tonight",
    hi: "आज रात बारिश की संभावना",
    pa: "ਅੱਜ ਰਾਤ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ",
    mr: "आज रात्री पावसाची शक्यता",
  },
  "Wait until tomorrow morning before treatment.": {
    en: "Wait until tomorrow morning before treatment.",
    hi: "उपचार करने से पहले कल सुबह तक प्रतीक्षा करें।",
    pa: "ਇਲਾਜ ਤੋਂ ਪਹਿਲਾਂ ਕੱਲ੍ਹ ਸਵੇਰ ਤੱਕ ਉਡੀਕ ਕਰੋ।",
    mr: "उपचार करण्यापूर्वी उद्या सकाळपर्यंत थांबा.",
  },
  "Today's task": { en: "Today's task", hi: "आज का कार्य", pa: "ਅੱਜ ਦਾ ਕੰਮ", mr: "आजचे काम" },
  "Remove affected leaves": {
    en: "Remove affected leaves",
    hi: "प्रभावित पत्तियाँ हटाएँ",
    pa: "ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ",
    mr: "प्रभावित पाने काढा",
  },
  "Remove infected leaves and keep them away from healthy plants.": {
    en: "Remove infected leaves and keep them away from healthy plants.",
    hi: "संक्रमित पत्तियाँ हटाएँ और उन्हें स्वस्थ पौधों से दूर रखें।",
    pa: "ਸੰਕਰਮਿਤ ਪੱਤੇ ਹਟਾਓ ਅਤੇ ਉਹਨਾਂ ਨੂੰ ਸਿਹਤਮੰਦ ਪੌਦਿਆਂ ਤੋਂ ਦੂਰ ਰੱਖੋ।",
    mr: "संक्रमित पाने काढा आणि ती निरोगी झाडांपासून दूर ठेवा.",
  },
  "Best time": { en: "Best time", hi: "सबसे अच्छा समय", pa: "ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ", mr: "सर्वोत्तम वेळ" },
  "Task Completed ✓": { en: "Task Completed ✓", hi: "कार्य पूरा ✓", pa: "ਕੰਮ ਪੂਰਾ ✓", mr: "काम पूर्ण ✓" },
  "Mark Task Complete": { en: "Mark Task Complete", hi: "कार्य पूरा चिह्नित करें", pa: "ਕੰਮ ਪੂਰਾ ਨਿਸ਼ਾਨ ਲਗਾਓ", mr: "काम पूर्ण म्हणून नोंदवा" },
  "Recovery timeline": { en: "Recovery timeline", hi: "रिकवरी समयरेखा", pa: "ਸੁਧਾਰ ਸਮਾਂਰੇਖਾ", mr: "पुनर्प्राप्ती कालरेषा" },
  "Disease identified": { en: "Disease identified", hi: "रोग की पहचान हुई", pa: "ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਹੋਈ", mr: "रोग ओळखला" },
  "Apply recommended treatment": { en: "Apply recommended treatment", hi: "अनुशंसित उपचार करें", pa: "ਸਿਫ਼ਾਰਸ਼ੀ ਇਲਾਜ ਕਰੋ", mr: "शिफारस केलेला उपचार करा" },
  "Check new leaf growth": { en: "Check new leaf growth", hi: "नई पत्तियों की वृद्धि जाँचें", pa: "ਨਵੇਂ ਪੱਤਿਆਂ ਦੀ ਵਾਧਾ ਜਾਂਚੋ", mr: "नवीन पानांची वाढ तपासा" },
  "Scan crop again": { en: "Scan crop again", hi: "फसल को फिर स्कैन करें", pa: "ਫਸਲ ਨੂੰ ਮੁੜ ਸਕੈਨ ਕਰੋ", mr: "पीक पुन्हा स्कॅन करा" },
  "Recovery": { en: "Recovery", hi: "रिकवरी", pa: "ਸੁਧਾਰ", mr: "पुनर्प्राप्ती" },
};

const DISEASES: Record<string, Translation> = {
  "Early Blight": { en: "Early Blight", hi: "अर्ली ब्लाइट", pa: "ਅਰਲੀ ਬਲਾਈਟ", mr: "अर्ली ब्लाइट" },
  "Late Blight": { en: "Late Blight", hi: "लेट ब्लाइट", pa: "ਲੇਟ ਬਲਾਈਟ", mr: "लेट ब्लाइट" },
  "Leaf Mold": { en: "Leaf Mold", hi: "लीफ मोल्ड", pa: "ਲੀਫ ਮੋਲਡ", mr: "लीफ मोल्ड" },
  "Septoria Leaf Spot": { en: "Septoria Leaf Spot", hi: "सेप्टोरिया लीफ स्पॉट", pa: "ਸੈਪਟੋਰੀਆ ਲੀਫ ਸਪਾਟ", mr: "सेप्टोरिया लीफ स्पॉट" },
  "Healthy": { en: "Healthy", hi: "स्वस्थ", pa: "ਸਿਹਤਮੰਦ", mr: "निरोगी" },
  "Northern Leaf Blight": { en: "Northern Leaf Blight", hi: "नॉर्दर्न लीफ ब्लाइट", pa: "ਨਾਰਦਰਨ ਲੀਫ ਬਲਾਈਟ", mr: "नॉर्दर्न लीफ ब्लाइट" },
  "Common Rust": { en: "Common Rust", hi: "कॉमन रस्ट", pa: "ਕਾਮਨ ਰਸਟ", mr: "कॉमन रस्ट" },
  "Gray Leaf Spot": { en: "Gray Leaf Spot", hi: "ग्रे लीफ स्पॉट", pa: "ਗ੍ਰੇ ਲੀਫ ਸਪਾਟ", mr: "ग्रे लीफ स्पॉट" },
  "Bacterial Leaf Blight": { en: "Bacterial Leaf Blight", hi: "बैक्टीरियल लीफ ब्लाइट", pa: "ਬੈਕਟੀਰੀਅਲ ਲੀਫ ਬਲਾਈਟ", mr: "बॅक्टेरियल लीफ ब्लाइट" },
  "Brown Spot": { en: "Brown Spot", hi: "ब्राउन स्पॉट", pa: "ਬਰਾਊਨ ਸਪਾਟ", mr: "ब्राउन स्पॉट" },
  "Leaf Smut": { en: "Leaf Smut", hi: "लीफ स्मट", pa: "ਲੀਫ ਸਮਟ", mr: "लीफ स्मट" },
};

const CROPS: Record<string, Translation> = {
  Tomato: { en: "Tomato", hi: "टमाटर", pa: "ਟਮਾਟਰ", mr: "टोमॅटो" },
  Maize: { en: "Maize", hi: "मक्का", pa: "ਮੱਕੀ", mr: "मका" },
  Rice: { en: "Rice", hi: "धान", pa: "ਧਾਨ", mr: "भात" },
  Wheat: { en: "Wheat", hi: "गेहूँ", pa: "ਕਣਕ", mr: "गहू" },
  Potato: { en: "Potato", hi: "आलू", pa: "ਆਲੂ", mr: "बटाटा" },
};

const PLACES: Record<string, Translation> = {
  Maharashtra: { en: "Maharashtra", hi: "महाराष्ट्र", pa: "ਮਹਾਰਾਸ਼ਟਰ", mr: "महाराष्ट्र" },
  Pune: { en: "Pune", hi: "पुणे", pa: "ਪੁਣੇ", mr: "पुणे" },
  Bihar: { en: "Bihar", hi: "बिहार", pa: "ਬਿਹਾਰ", mr: "बिहार" },
  Punjab: { en: "Punjab", hi: "पंजाब", pa: "ਪੰਜਾਬ", mr: "पंजाब" },
  Haryana: { en: "Haryana", hi: "हरियाणा", pa: "ਹਰਿਆਣਾ", mr: "हरियाणा" },
  "Uttar Pradesh": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", pa: "ਉੱਤਰ ਪ੍ਰਦੇਸ਼", mr: "उत्तर प्रदेश" },
};

const VALUES: Record<string, Translation> = {
  Low: TEXT.Low,
  Medium: TEXT.Medium,
  High: TEXT.High,
  Uncertain: TEXT.Uncertain,
  Sandy: { en: "Sandy", hi: "रेतीली", pa: "ਰੇਤਲੀ", mr: "वालुकामय" },
  Clay: { en: "Clay", hi: "चिकनी मिट्टी", pa: "ਚਿਕਣੀ ਮਿੱਟੀ", mr: "चिकणमाती" },
  Loam: { en: "Loam", hi: "दोमट", pa: "ਦੋਮਟ", mr: "लोम" },
  Loamy: { en: "Loamy", hi: "दोमट", pa: "ਦੋਮਟ", mr: "लोमयुक्त" },
  "Clay Loam": { en: "Clay Loam", hi: "चिकनी दोमट", pa: "ਚਿਕਣੀ ਦੋਮਟ", mr: "चिकण लोम" },
};

export function tx(key: string, language: Language): string {
  return TEXT[key]?.[language] ?? key;
}

export function translateDisease(name: string, language: Language): string {
  const clean = (name || "").replaceAll("_", " ").trim();
  return DISEASES[clean]?.[language] ?? clean;
}

export function translateCrop(name: string, language: Language): string {
  const clean = (name || "").trim();
  return CROPS[clean]?.[language] ?? clean;
}

export function translatePlace(name: string, language: Language): string {
  const clean = (name || "").trim();
  return PLACES[clean]?.[language] ?? clean;
}

export function translateValue(value: string, language: Language): string {
  const clean = (value || "").trim();
  return VALUES[clean]?.[language] ?? tx(clean, language);
}

export function translateWeatherRisk(value: string, language: Language): string {
  if (!value) return tx("Weather unavailable", language);
  return value
    .split(",")
    .map((part) => tx(part.trim(), language))
    .join(", ");
}

export function translateRecommendedAction(
  action: string,
  disease: string,
  language: Language
): string {
  if (!action || language === "en") return action;

  const d = translateDisease(disease, language);

  if (action === "Crop looks healthy. Continue regular monitoring.") {
    return language === "hi"
      ? "फसल स्वस्थ दिख रही है। नियमित निगरानी जारी रखें।"
      : language === "pa"
      ? "ਫਸਲ ਸਿਹਤਮੰਦ ਲੱਗ ਰਹੀ ਹੈ। ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਜਾਰੀ ਰੱਖੋ।"
      : "पीक निरोगी दिसत आहे. नियमित निरीक्षण सुरू ठेवा.";
  }

  if (action.startsWith("Prediction is uncertain.")) {
    return language === "hi"
      ? "पूर्वानुमान अनिश्चित है। कृपया पत्ती की अधिक स्पष्ट तस्वीर अपलोड करें या कृषि विशेषज्ञ से सलाह लें।"
      : language === "pa"
      ? "ਅਨੁਮਾਨ ਅਨਿਸ਼ਚਿਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਪੱਤੀ ਦੀ ਹੋਰ ਸਾਫ਼ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ ਜਾਂ ਖੇਤੀ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।"
      : "अंदाज अनिश्चित आहे. कृपया पानाचा अधिक स्पष्ट फोटो अपलोड करा किंवा कृषी तज्ज्ञांचा सल्ला घ्या.";
  }

  if (action.startsWith("Avoid spraying today because rain")) {
    return language === "hi"
      ? "आज छिड़काव न करें क्योंकि बारिश उपचार को धो सकती है। कल सुबह फिर जाँचें।"
      : language === "pa"
      ? "ਅੱਜ ਛਿੜਕਾਅ ਨਾ ਕਰੋ ਕਿਉਂਕਿ ਮੀਂਹ ਇਲਾਜ ਨੂੰ ਧੋ ਸਕਦਾ ਹੈ। ਕੱਲ੍ਹ ਸਵੇਰੇ ਮੁੜ ਜਾਂਚੋ।"
      : "आज फवारणी करू नका कारण पावसामुळे उपचार धुऊन जाऊ शकतो. उद्या सकाळी पुन्हा तपासा.";
  }

  if (action.startsWith("Avoid spraying now because high wind")) {
    return language === "hi"
      ? "अभी छिड़काव न करें क्योंकि तेज हवा दवा को असमान रूप से फैला सकती है। हवा कम होने पर छिड़काव करें।"
      : language === "pa"
      ? "ਹੁਣ ਛਿੜਕਾਅ ਨਾ ਕਰੋ ਕਿਉਂਕਿ ਤੇਜ਼ ਹਵਾ ਦਵਾਈ ਨੂੰ ਅਸਮਾਨ ਤਰੀਕੇ ਨਾਲ ਫੈਲਾ ਸਕਦੀ ਹੈ। ਹਵਾ ਘੱਟ ਹੋਣ ਤੇ ਛਿੜਕਾਅ ਕਰੋ।"
      : "आत्ता फवारणी करू नका कारण जोराच्या वाऱ्यामुळे औषध असमान पसरू शकते. वारा कमी झाल्यावर फवारणी करा.";
  }

  if (action.includes("risk may spread faster due to high humidity")) {
    return language === "hi"
      ? `${d} का जोखिम अधिक आर्द्रता के कारण तेजी से फैल सकता है। नज़दीकी निगरानी करें और निवारक कार्रवाई करें।`
      : language === "pa"
      ? `${d} ਦਾ ਖਤਰਾ ਵੱਧ ਨਮੀ ਕਾਰਨ ਤੇਜ਼ੀ ਨਾਲ ਫੈਲ ਸਕਦਾ ਹੈ। ਧਿਆਨ ਨਾਲ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਰੋਕਥਾਮੀ ਕਾਰਵਾਈ ਕਰੋ।`
      : `${d} चा धोका जास्त आर्द्रतेमुळे वेगाने पसरू शकतो. बारकाईने निरीक्षण करा आणि प्रतिबंधात्मक कृती करा.`;
  }

  if (action.includes("detected. Weather looks suitable for treatment.")) {
    return language === "hi"
      ? `${d} पाया गया है। मौसम उपचार के लिए उपयुक्त है। सुबह या शाम के समय कार्रवाई करें।`
      : language === "pa"
      ? `${d} ਮਿਲਿਆ ਹੈ। ਮੌਸਮ ਇਲਾਜ ਲਈ ਢੁਕਵਾਂ ਹੈ। ਸਵੇਰੇ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਕਾਰਵਾਈ ਕਰੋ।`
      : `${d} आढळला आहे. हवामान उपचारासाठी योग्य आहे. सकाळी किंवा संध्याकाळी कृती करा.`;
  }

  return action;
}

export function translateSoilText(value: string, language: Language): string {
  if (!value || language === "en") return value;

  const exact: Record<string, Omit<Translation, "en">> = {
    "High soil moisture retention combined with wet weather increases fungal spread risk": {
      hi: "मिट्टी में अधिक नमी और गीला मौसम फफूंद फैलने का जोखिम बढ़ाते हैं",
      pa: "ਮਿੱਟੀ ਵਿੱਚ ਵੱਧ ਨਮੀ ਅਤੇ ਗਿੱਲਾ ਮੌਸਮ ਫੰਗਸ ਫੈਲਣ ਦਾ ਖਤਰਾ ਵਧਾਉਂਦੇ ਹਨ",
      mr: "मातीतील जास्त ओलावा आणि ओले हवामान बुरशी पसरण्याचा धोका वाढवतात",
    },
    "Improve field drainage and avoid overhead irrigation": {
      hi: "खेत की जल निकासी सुधारें और ऊपर से सिंचाई करने से बचें",
      pa: "ਖੇਤ ਦੀ ਨਿਕਾਸੀ ਸੁਧਾਰੋ ਅਤੇ ਉੱਪਰੋਂ ਸਿੰਚਾਈ ਤੋਂ ਬਚੋ",
      mr: "शेतातील निचरा सुधारा आणि वरून पाणी देणे टाळा",
    },
    "Low soil potassium can weaken plant disease resistance": {
      hi: "मिट्टी में कम पोटैशियम पौधों की रोग प्रतिरोधक क्षमता कम कर सकता है",
      pa: "ਮਿੱਟੀ ਵਿੱਚ ਘੱਟ ਪੋਟਾਸ਼ੀਅਮ ਪੌਦੇ ਦੀ ਰੋਗ-ਰੋਕੂ ਸਮਰੱਥਾ ਘਟਾ ਸਕਦਾ ਹੈ",
      mr: "मातीतील कमी पोटॅशियम पिकाची रोगप्रतिकारक क्षमता कमी करू शकते",
    },
    "Consider a potassium-rich supplement (e.g. muriate of potash) after consulting a local agriculture officer": {
      hi: "स्थानीय कृषि अधिकारी से सलाह के बाद पोटैशियम युक्त पूरक देने पर विचार करें",
      pa: "ਸਥਾਨਕ ਖੇਤੀ ਅਧਿਕਾਰੀ ਨਾਲ ਸਲਾਹ ਤੋਂ ਬਾਅਦ ਪੋਟਾਸ਼ੀਅਮ ਵਾਲਾ ਪੂਰਕ ਦੇਣ ਬਾਰੇ ਸੋਚੋ",
      mr: "स्थानिक कृषी अधिकाऱ्याच्या सल्ल्यानंतर पोटॅशियमयुक्त पूरक देण्याचा विचार करा",
    },
    "Low soil nitrogen may slow plant recovery after treatment": {
      hi: "मिट्टी में कम नाइट्रोजन उपचार के बाद पौधे की रिकवरी धीमी कर सकती है",
      pa: "ਮਿੱਟੀ ਵਿੱਚ ਘੱਟ ਨਾਈਟ੍ਰੋਜਨ ਇਲਾਜ ਤੋਂ ਬਾਅਦ ਪੌਦੇ ਦੀ ਸੁਧਾਰ ਪ੍ਰਕਿਰਿਆ ਹੌਲੀ ਕਰ ਸਕਦੀ ਹੈ",
      mr: "मातीतील कमी नायट्रोजन उपचारानंतर पिकाची पुनर्प्राप्ती मंद करू शकते",
    },
    "Low soil phosphorus can affect root strength and recovery": {
      hi: "मिट्टी में कम फॉस्फोरस जड़ों की मजबूती और रिकवरी को प्रभावित कर सकता है",
      pa: "ਮਿੱਟੀ ਵਿੱਚ ਘੱਟ ਫਾਸਫੋਰਸ ਜੜਾਂ ਦੀ ਮਜ਼ਬੂਤੀ ਅਤੇ ਸੁਧਾਰ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰ ਸਕਦਾ ਹੈ",
      mr: "मातीतील कमी फॉस्फरस मुळांची ताकद आणि पुनर्प्राप्तीवर परिणाम करू शकतो",
    },
    "Adding organic compost/manure can improve long-term soil health and plant resilience": {
      hi: "जैविक कम्पोस्ट/खाद मिलाने से लंबे समय में मिट्टी का स्वास्थ्य और पौधों की मजबूती सुधर सकती है",
      pa: "ਜੈਵਿਕ ਕੰਪੋਸਟ/ਖਾਦ ਪਾਉਣ ਨਾਲ ਲੰਬੇ ਸਮੇਂ ਵਿੱਚ ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ ਪੌਦੇ ਦੀ ਮਜ਼ਬੂਤੀ ਸੁਧਰ ਸਕਦੀ ਹੈ",
      mr: "सेंद्रिय कंपोस्ट/खत घातल्याने दीर्घकाळ मातीचे आरोग्य आणि पिकाची ताकद सुधारू शकते",
    },
    "Soil conditions in this district do not show major added risk factors for the detected issue.": {
      hi: "इस जिले की मिट्टी की स्थिति पाए गए रोग के लिए कोई बड़ा अतिरिक्त जोखिम नहीं दिखाती।",
      pa: "ਇਸ ਜ਼ਿਲ੍ਹੇ ਦੀ ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ ਮਿਲੀ ਸਮੱਸਿਆ ਲਈ ਕੋਈ ਵੱਡਾ ਵਾਧੂ ਖਤਰਾ ਨਹੀਂ ਦਿਖਾਉਂਦੀ।",
      mr: "या जिल्ह्यातील मातीची स्थिती आढळलेल्या समस्येसाठी मोठा अतिरिक्त धोका दाखवत नाही.",
    },
    "Soil conditions in this district are likely adding to the crop's risk alongside the detected issue.": {
      hi: "इस जिले की मिट्टी की स्थिति पाए गए रोग के साथ फसल का जोखिम भी बढ़ा सकती है।",
      pa: "ਇਸ ਜ਼ਿਲ੍ਹੇ ਦੀ ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ ਮਿਲੀ ਸਮੱਸਿਆ ਦੇ ਨਾਲ ਫਸਲ ਦਾ ਖਤਰਾ ਵੀ ਵਧਾ ਸਕਦੀ ਹੈ।",
      mr: "या जिल्ह्यातील मातीची स्थिती आढळलेल्या समस्येसोबत पिकाचा धोका वाढवत असण्याची शक्यता आहे.",
    },
    "Soil conditions in this district may be mildly contributing to the detected issue.": {
      hi: "इस जिले की मिट्टी की स्थिति पाए गए रोग में हल्का योगदान दे सकती है।",
      pa: "ਇਸ ਜ਼ਿਲ੍ਹੇ ਦੀ ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ ਮਿਲੀ ਸਮੱਸਿਆ ਵਿੱਚ ਥੋੜ੍ਹਾ ਯੋਗਦਾਨ ਪਾ ਸਕਦੀ ਹੈ।",
      mr: "या जिल्ह्यातील मातीची स्थिती आढळलेल्या समस्येत थोडे योगदान देत असू शकते.",
    },
  };

  if (exact[value]) return exact[value][language as "hi" | "pa" | "mr"];

  if (value.startsWith("Soil pH (") && value.includes("outside the ideal 6.0-6.8 range")) {
    const match = value.match(/Soil pH \(([^)]+)\)/);
    const ph = match?.[1] ?? "";
    return language === "hi"
      ? `मिट्टी का pH (${ph}) टमाटर के लिए आदर्श 6.0–6.8 सीमा से बाहर है, जिससे पौधे पर अतिरिक्त तनाव बढ़ सकता है`
      : language === "pa"
      ? `ਮਿੱਟੀ ਦਾ pH (${ph}) ਟਮਾਟਰ ਲਈ ਆਦਰਸ਼ 6.0–6.8 ਹੱਦ ਤੋਂ ਬਾਹਰ ਹੈ, ਜਿਸ ਨਾਲ ਪੌਦੇ ਉੱਤੇ ਵਾਧੂ ਤਣਾਅ ਹੋ ਸਕਦਾ ਹੈ`
      : `मातीचा pH (${ph}) टोमॅटोसाठी आदर्श 6.0–6.8 मर्यादेबाहेर आहे, त्यामुळे पिकावर अतिरिक्त ताण येऊ शकतो`;
  }

  return value;
}

export function recoveryTitle(disease: string, language: Language): string {
  const d = translateDisease(disease || "Disease", language);
  if (language === "en") return `${d} Recovery`;
  if (language === "hi") return `${d} रिकवरी`;
  if (language === "pa") return `${d} ਸੁਧਾਰ`;
  return `${d} पुनर्प्राप्ती`;
}

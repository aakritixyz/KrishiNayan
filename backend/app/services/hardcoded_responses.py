"""
Hardcoded responses for common farmer questions.
Provides specific, actionable answers for question types that
often get generic responses from RAG/LLM.
"""


def get_hardcoded_response(query, context, language="en"):
    """
    Check if the query matches a common question pattern and return
    a specific hardcoded response. Returns None if no match.
    """
    query_lower = query.lower()
    crop = (context or {}).get("crop", "").lower()
    disease = ((context or {}).get("diagnosis") or {}).get("disease", "").lower()
    
    # Recovery plan questions
    if any(term in query_lower for term in ["recovery", "recover", "treatment", "cure", "how to fix", "what to do"]):
        return _get_recovery_response(crop, disease, language)
    
    # Fertilizer questions
    if any(term in query_lower for term in ["fertilizer", "fertilise", "nutrient", "feed", "manure"]):
        return _get_fertilizer_response(crop, language)
    
    # Pesticide questions
    if any(term in query_lower for term in ["pesticide", "chemical", "spray", "medicine", "fungicide"]):
        return _get_pesticide_response(crop, disease, language)
    
    # Disease knowledge questions
    if any(term in query_lower for term in ["disease", "symptom", "identify", "what is", "about disease"]):
        return _get_disease_response(crop, disease, language)
    
    # Cost questions
    if any(term in query_lower for term in ["cost", "price", "money", "expense", "budget"]):
        return _get_cost_response(crop, language)
    
    # Weather questions
    if any(term in query_lower for term in ["weather", "rain", "temperature", "climate"]):
        return _get_weather_response(crop, language)
    
    # Soil questions
    if any(term in query_lower for term in ["soil", "land", "earth", "ground"]):
        return _get_soil_response(crop, language)
    
    return None


def _get_recovery_response(crop, disease, language):
    """Get crop-specific recovery plan responses."""
    responses = {
        "tomato": {
            "en": "For Tomato recovery: 1) Remove infected leaves/plants immediately. 2) Improve air circulation by proper spacing. 3) Avoid overhead watering - water at base. 4) Apply fungicide like mancozeb or copper-based products. 5) Ensure balanced nutrition with potassium. 6) Monitor daily for spread. Consult local KVK for specific product recommendations based on your disease.",
            "hi": "टमाटर की रिकवरी के लिए: 1) संक्रमित पत्ते/पौधे तुरंत हटाएं। 2) उचित दूरी से हवा का प्रवाह सुनिश्चित करें। 3) ऊपर से पानी न दें - जड़ में पानी दें। 4) मैंकोज़ेब या कॉपर-आधारित फफूंदनाशक लगाएं। 5) पोटैशियम से संतुलित पोषण सुनिश्चित करें। 6) फैलने के लिए रोज़ निरीक्षण करें। विशिष्ट उत्पाद के लिए स्थानीय KVK से संपर्क करें।"
        },
        "rice": {
            "en": "For Rice recovery: 1) Drain excess water from field. 2) Remove infected tillers. 3) Apply nitrogen fertilizer in split doses. 4) Use fungicide like tricyclazole or isoprothiolane. 5) Maintain proper water management. 6) Avoid heavy nitrogen application. Consult local KVK for disease-specific treatment.",
            "hi": "चावल की रिकवरी के लिए: 1) खेत से अधिक पानी निकालें। 2) संक्रमित कल्ले हटाएं। 3) नाइट्रोजन उर्वरक विभाजित खुराक में लगाएं। 4) ट्राइसाइक्लाज़ोल या इसोप्रोथियोलेन जैसा फफूंदनाशक लगाएं। 5) उचित पानी प्रबंधन बनाए रखें। 6) भारी नाइट्रोजन लगाने से बचें। रोग-विशिष्ट उपचार के लिए स्थानीय KVK से संपर्क करें।"
        },
        "maize": {
            "en": "For Maize recovery: 1) Remove heavily infected plants. 2) Improve drainage in field. 3) Apply balanced fertilizer with adequate potassium. 4) Use fungicide like mancozeb or carbendazim. 5) Rotate crops next season. 6) Ensure proper plant spacing. Consult local KVK for specific recommendations.",
            "hi": "मक्का की रिकवरी के लिए: 1) भारी संक्रमित पौधे हटाएं। 2) खेत में जल निकासी सुधारें। 3) पर्याप्त पोटैशियम के साथ संतुलित उर्वरक लगाएं। 4) मैंकोज़ेब या कार्बेंडाज़िम जैसा फफूंदनाशक लगाएं। 5) अगले सीजन में फसल रोटेशन करें। 6) उचित पौधे की दूरी सुनिश्चित करें। विशिष्ट सिफारिशों के लिए स्थानीय KVK से संपर्क करें।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"  # Default to tomato
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])


def _get_fertilizer_response(crop, language):
    """Get crop-specific fertilizer recommendations."""
    responses = {
        "tomato": {
            "en": "Tomato fertilizer schedule: 1) Basal: 50kg N + 50kg P + 50kg K per hectare at planting. 2) 30 days after planting: 25kg N. 3) 60 days after planting: 25kg N. Use organic manure (2-3 tons/acre) as base. Ensure adequate calcium and magnesium. Soil testing recommended for precise dosing.",
            "hi": "टमाटर उर्वरक अनुसूची: 1) आधार: रोपण के समय प्रति हेक्टेयर 50किग्रा N + 50किग्रा P + 50किग्रा K। 2) रोपण के 30 दिन बाद: 25किग्रा N। 3) रोपण के 60 दिन बाद: 25किग्रा N। आधार के रूप में जैविक खाद (2-3 टन/एकड़) का उपयोग करें। पर्याप्त कैल्शियम और मैग्नीशियम सुनिश्चित करें। सटीक खुराक के लिए मिट्टी परीक्षण अनुशंसित।"
        },
        "rice": {
            "en": "Rice fertilizer schedule: 1) Basal: 30kg N + 30kg P + 30kg K per hectare at planting. 2) Tillering stage: 30kg N. 3) Panicle initiation: 30kg N. Use zinc sulfate (25kg/ha) if deficient. Split nitrogen application reduces losses. Soil testing recommended.",
            "hi": "चावल उर्वरक अनुसूची: 1) आधार: रोपण के समय प्रति हेक्टेयर 30किग्रा N + 30किग्रा P + 30किग्रा K। 2) कल्लीनिकरण अवस्था: 30किग्रा N। 3) पैनिकल आरंभ: 30किग्रा N। कमी होने पर ज़िंक सल्फेट (25किग्रा/हेक्टेयर) का उपयोग करें। विभाजित नाइट्रोजन लगाने से नुकसान कम होता है। मिट्टी परीक्षण अनुशंसित।"
        },
        "maize": {
            "en": "Maize fertilizer schedule: 1) Basal: 60kg N + 30kg P + 30kg K per hectare at planting. 2) 30 days after planting: 30kg N. 3) 60 days after planting: 30kg N. Ensure adequate sulfur and micronutrients. Use organic manure as base. Soil testing recommended.",
            "hi": "मक्का उर्वरक अनुसूची: 1) आधार: रोपण के समय प्रति हेक्टेयर 60किग्रा N + 30किग्रा P + 30किग्रा K। 2) रोपण के 30 दिन बाद: 30किग्रा N। 3) रोपण के 60 दिन बाद: 30किग्रा N। पर्याप्त सल्फर और सूक्ष्म पोषक तत्व सुनिश्चित करें। आधार के रूप में जैविक खाद का उपयोग करें। मिट्टी परीक्षण अनुशंसित।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])


def _get_pesticide_response(crop, disease, language):
    """Get crop-specific pesticide recommendations."""
    responses = {
        "tomato": {
            "en": "Tomato pesticide recommendations: For fungal diseases use mancozeb (2g/liter) or copper oxychloride (3g/liter). For pests use imidacloprid (0.5ml/liter) or chlorpyrifos (2ml/liter). Always follow label instructions. Apply during evening hours. Don't spray if rain expected within 6 hours. Consult KVK for specific disease treatment.",
            "hi": "टमाटर कीटनाशक सिफारिशें: फफूंद रोगों के लिए मैंकोज़ेब (2ग्राम/लीटर) या कॉपर ऑक्सीक्लोराइड (3ग्राम/लीटर) का उपयोग करें। कीटों के लिए इमिडाक्लोप्रिड (0.5मिली/लीटर) या क्लोरपायरीफॉस (2मिली/लीटर) का उपयोग करें। हमेशा लेबल निर्देशों का पालन करें। शाम के समय छिड़काव करें। 6 घंटे के भीतर बारिश की उम्मीद हो तो छिड़काव न करें। विशिष्ट रोग उपचार के लिए KVK से संपर्क करें।"
        },
        "rice": {
            "en": "Rice pesticide recommendations: For sheath blight use tricyclazole (0.6g/liter). For blast use isoprothiolane (1.5ml/liter). For pests use cartap hydrochloride (1kg/ha) or fipronil (0.05kg/ha). Follow label doses. Apply during morning or evening. Maintain proper water level. Consult KVK for specific recommendations.",
            "hi": "चावल कीटनाशक सिफारिशें: शीथ ब्लाइट के लिए ट्राइसाइक्लाज़ोल (0.6ग्राम/लीटर) का उपयोग करें। ब्लास्ट के लिए इसोप्रोथियोलेन (1.5मिली/लीटर) का उपयोग करें। कीटों के लिए कार्टैप हाइड्रोक्लोराइड (1किग्रा/हेक्टेयर) या फिप्रोनिल (0.05किग्रा/हेक्टेयर) का उपयोग करें। लेबल खुराक का पालन करें। सुबह या शाम को छिड़काव करें। उचित पानी स्तर बनाए रखें। विशिष्ट सिफारिशों के लिए KVK से संपर्क करें।"
        },
        "maize": {
            "en": "Maize pesticide recommendations: For leaf blight use mancozeb (2.5g/liter). For fall armyworm use emamectin benzoate (0.5g/liter) or chlorantraniliprole (0.3ml/liter). Follow label instructions. Apply during evening. Don't spray during flowering. Consult KVK for specific pest management.",
            "hi": "मक्का कीटनाशक सिफारिशें: पत्ती ब्लाइट के लिए मैंकोज़ेब (2.5ग्राम/लीटर) का उपयोग करें। फॉल आर्मीवर्म के लिए एमामेक्टिन बेंज़ोएट (0.5ग्राम/लीटर) या क्लोरांट्रानिलिप्रोल (0.3मिली/लीटर) का उपयोग करें। लेबल निर्देशों का पालन करें। शाम को छिड़काव करें। फूलने के दौरान छिड़काव न करें। विशिष्ट कीट प्रबंधन के लिए KVK से संपर्क करें।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])


def _get_disease_response(crop, disease, language):
    """Get crop-specific disease information."""
    responses = {
        "tomato": {
            "en": "Common Tomato diseases: Late Blight (water-soaked patches, white fungus), Early Blight (concentric rings on leaves), Septoria Leaf Spot (small dark spots with yellow halos), Bacterial Wilt (sudden wilting). Prevention: crop rotation, resistant varieties, proper spacing, avoid overhead watering, remove infected material.",
            "hi": "टमाटर के सामान्य रोग: लेट ब्लाइट (पानी-सोखे हुए धब्बे, सफेद फफूंद), अर्ली ब्लाइट (पत्तियों पर संकेंद्रिक छल्ले), सेप्टोरिया लीफ स्पॉट (पीले हलो के साथ छोटे गहरे धब्बे), बैैक्टीरियल विल्ट (अचानक मुरझाना)। रोकथाम: फसल रोटेशन, प्रतिरोधी किस्में, उचित दूरी, ऊपर से पानी न दें, संक्रमित सामग्री हटाएं।"
        },
        "rice": {
            "en": "Common Rice diseases: Sheath Blight (oval lesions on sheaths), Blast (spindle-shaped spots), Bacterial Leaf Blight (yellowing and drying). Prevention: balanced fertilization, proper water management, resistant varieties, field sanitation, avoid excessive nitrogen.",
            "hi": "चावल के सामान्य रोग: शीथ ब्लाइट (पत्तियों पर अंडाकार घाव), ब्लास्ट (स्पिंडल-आकार के धब्बे), बैक्टीरियल लीफ ब्लाइट (पीलापन और सूखना)। रोकथाम: संतुलित उर्वरक, उचित पानी प्रबंधन, प्रतिरोधी किस्में, खेट स्वच्छता, अधिक नाइट्रोजन से बचें।"
        },
        "maize": {
            "en": "Common Maize diseases: Northern Corn Leaf Blight (long tan lesions), Gray Leaf Spot (rectangular gray spots), Common Rust (orange-brown pustules). Prevention: crop rotation, resistant hybrids, proper plant density, balanced nutrition, timely planting.",
            "hi": "मक्का के सामान्य रोग: नॉर्दर्न कॉर्न लीफ ब्लाइट (लंबे भूरे घाव), ग्रे लीफ स्पॉट (आयताकार भूरे धब्बे), कॉमन रस्ट (नारंगी-भूरे फफूंद)। रोकथाम: फसल रोटेशन, प्रतिरोधी हाइब्रिड, उचित पौधे घनत्व, संतुलित पोषण, समय पर बुवाई।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])


def _get_cost_response(crop, language):
    """Get crop-specific cost estimates."""
    responses = {
        "tomato": {
            "en": "Tomato cultivation cost estimate (per acre): Seeds: ₹2,000-3,000, Fertilizers: ₹4,000-5,000, Pesticides: ₹2,000-3,000, Labor: ₹8,000-10,000, Irrigation: ₹2,000-3,000, Total: ₹18,000-24,000. Returns vary by market price (₹10-30/kg) and yield (15-25 tons/acre). Actual costs vary by location and practices.",
            "hi": "टमाटर की खेती लागत अनुमान (प्रति एकड़): बीज: ₹2,000-3,000, उर्वरक: ₹4,000-5,000, कीटनाशक: ₹2,000-3,000, श्रम: ₹8,000-10,000, सिंचाई: ₹2,000-3,000, कुल: ₹18,000-24,000। बाजार मूल्य (₹10-30/किग्रा) और उपज (15-25 टन/एकड़) के अनुसार रिटर्न भिन्न होते हैं। वास्तविक लागत स्थान और प्रथाओं के अनुसार भिन्न होती है।"
        },
        "rice": {
            "en": "Rice cultivation cost estimate (per acre): Seeds: ₹1,500-2,000, Fertilizers: ₹3,000-4,000, Pesticides: ₹1,500-2,000, Labor: ₹6,000-8,000, Irrigation: ₹3,000-4,000, Total: ₹15,000-20,000. Returns vary by market price (₹20-35/kg) and yield (2.5-4 tons/acre). Actual costs vary by location.",
            "hi": "चावल की खेती लागत अनुमान (प्रति एकड़): बीज: ₹1,500-2,000, उर्वरक: ₹3,000-4,000, कीटनाशक: ₹1,500-2,000, श्रम: ₹6,000-8,000, सिंचाई: ₹3,000-4,000, कुल: ₹15,000-20,000। बाजार मूल्य (₹20-35/किग्रा) और उपज (2.5-4 टन/एकड़) के अनुसार रिटर्न भिन्न होते हैं। वास्तविक लागत स्थान के अनुसार भिन्न होती है।"
        },
        "maize": {
            "en": "Maize cultivation cost estimate (per acre): Seeds: ₹2,000-2,500, Fertilizers: ₹3,500-4,500, Pesticides: ₹1,000-1,500, Labor: ₹5,000-7,000, Irrigation: ₹1,500-2,000, Total: ₹13,000-17,500. Returns vary by market price (₹15-25/kg) and yield (3-5 tons/acre). Actual costs vary by location.",
            "hi": "मक्का की खेती लागत अनुमान (प्रति एकड़): बीज: ₹2,000-2,500, उर्वरक: ₹3,500-4,500, कीटनाशक: ₹1,000-1,500, श्रम: ₹5,000-7,000, सिंचाई: ₹1,500-2,000, कुल: ₹13,000-17,500। बाजार मूल्य (₹15-25/किग्रा) और उपज (3-5 टन/एकड़) के अनुसार रिटर्न भिन्न होते हैं। वास्तविक लागत स्थान के अनुसार भिन्न होती है।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])


def _get_weather_response(crop, language):
    """Get crop-specific weather guidance."""
    responses = {
        "tomato": {
            "en": "Tomato weather needs: Temperature: 20-30°C optimal. Avoid below 15°C or above 35°C. Humidity: 60-80% ideal. Rain: Moderate rainfall (500-700mm) needed. Excess humidity increases disease risk. Provide shade during extreme heat. Protect from heavy rain.",
            "hi": "टमाटर मौसम आवश्यकताएं: तापमान: 20-30°C इष्टतम। 15°C से नीचे या 35°C से ऊपर से बचें। नमी: 60-80% आदर्श। बारिश: मध्यम वर्षा (500-700मिमी) आवश्यक। अधिक नमी रोग जोखिम बढ़ाती है। अत्यधिक गर्मी के दौरान छाया प्रदान करें। भारी बारिश से बचाव करें।"
        },
        "rice": {
            "en": "Rice weather needs: Temperature: 20-35°C optimal. Needs plenty of water. Humidity: High humidity preferred. Rain: 1001500mm rainfall needed. Standing water in fields is normal. Temperature below 20°C slows growth. Monitor for disease in high humidity.",
            "hi": "चावल मौसम आवश्यकताएं: तापमान: 20-35°C इष्टतम। खूब पानी की आवश्यकता। नमी: उच्च नमी पसंद की जाती है। बारिश: 1000-1500मिमी वर्षा आवश्यक। खेतों में खड़ा पानी सामान्य है। 20°C से नीचे तापमान विकास धीमा करता है। उच्च नमी में रोग के लिए निगरानी करें।"
        },
        "maize": {
            "en": "Maize weather needs: Temperature: 25-30°C optimal. Avoid below 10°C. Humidity: Moderate humidity preferred. Rain: 500-800mm rainfall needed. Drought stress affects yield. Good drainage essential. Excess rain causes lodging.",
            "hi": "मक्का मौसम आवश्यकताएं: तापमान: 25-30°C इष्टतम। 10°C से नीचे से बचें। नमी: मध्यम नमी पसंद की जाती है। बारिश: 500-800मिमी वर्षा आवश्यक। सूखे का तनाव उपज को प्रभावित करता है। अच्छी जल निकासी आवश्यक। अधिक बारिश लॉजिंग का कारण बनती है।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])


def _get_soil_response(crop, language):
    """Get crop-specific soil requirements."""
    responses = {
        "tomato": {
            "en": "Tomato soil requirements: pH: 6.0-7.0 optimal. Soil type: Well-drained loam soil preferred. Organic matter: 2-3% needed. Avoid waterlogging. Add organic compost before planting. Ensure good drainage. Soil testing recommended for precise nutrient management.",
            "hi": "टमाटर मिट्टी आवश्यकताएं: pH: 6.0-7.0 इष्टतम। मिट्टी का प्रकार: अच्छी जल निकासी वाली दोमट मिट्टी पसंद की जाती है। जैविक पदार्थ: 2-3% आवश्यक। जल भराव से बचें। रोपण से पहले जैविक कंपोस्ट डालें। अच्छी जल निकासी सुनिश्चित करें। सटीक पोषक प्रबंधन के लिए मिट्टी परीक्षण अनुशंसित।"
        },
        "rice": {
            "en": "Rice soil requirements: pH: 5.5-6.5 optimal. Soil type: Clay loam or clay soil preferred. Can tolerate waterlogging. Organic matter: 2-3% beneficial. Good water retention needed. Can grow in various soil types with proper management.",
            "hi": "चावल मिट्टी आवश्यकताएं: pH: 5.5-6.5 इष्टतम। मिट्टी का प्रकार: मिट्टी दोमट या मिट्टी पसंद की जाती है। जल भराव सहन कर सकता है। जैविक पदार्थ: 2-3% लाभदायक। अच्छा पानी रोकथाम आवश्यक। उचित प्रबंधन के साथ विभिन्न मिट्टी प्रकारों में उग सकता है।"
        },
        "maize": {
            "en": "Maize soil requirements: pH: 5.8-7.0 optimal. Soil type: Well-drained sandy loam preferred. Organic matter: 1.5-2.5% needed. Avoid heavy clay soils. Deep soil (60cm+) preferred. Good drainage essential. Soil testing recommended.",
            "hi": "मक्का मिट्टी आवश्यकताएं: pH: 5.8-7.0 इष्टतम। मिट्टी का प्रकार: अच्छी जल निकासी वाली रेतीली दोमट मिट्टी पसंद की जाती है। जैविक पदार्थ: 1.5-2.5% आवश्यक। भारी मिट्टी से बचें। गहरी मिट्टी (60सेमी+) पसंद की जाती है। अच्छी जल निकासी आवश्यक। मिट्टी परीक्षण अनुशंसित।"
        }
    }
    
    crop_key = crop if crop in responses else "tomato"
    return responses.get(crop_key, responses["tomato"]).get(language, responses["tomato"]["en"])

def get_severity(disease, confidence):
    if disease == "Healthy":
        return "Low"

    if confidence >= 90:
        return "High"

    if confidence >= 70:
        return "Medium"

    return "Uncertain"


def get_weather_risk(rain_expected=False, wind_speed=0, humidity=0):
    risks = []

    if rain_expected:
        risks.append("Rain expected")

    if wind_speed >= 15:
        risks.append("High wind")

    if humidity >= 80:
        risks.append("High humidity")

    if not risks:
        return "Low weather risk"

    return ", ".join(risks)


def get_recommended_action(disease, confidence, rain_expected=False, wind_speed=0, humidity=0):
    if disease == "Healthy":
        return "Crop looks healthy. Continue regular monitoring."

    if confidence < 70:
        return "Prediction is uncertain. Please upload a clearer leaf image or consult an agriculture expert."

    if rain_expected:
        return "Avoid spraying today because rain may wash away the treatment. Check again tomorrow morning."

    if wind_speed >= 15:
        return "Avoid spraying now because high wind can spread the spray unevenly. Spray when wind is lower."

    if humidity >= 80:
        return f"{disease} risk may spread faster due to high humidity. Monitor closely and take preventive action."

    return f"{disease} detected. Weather looks suitable for treatment. Take action during morning or evening hours."


def get_farmer_message(disease, confidence, rain_expected=False, wind_speed=0, humidity=0):
    severity = get_severity(disease, confidence)
    weather_risk = get_weather_risk(rain_expected, wind_speed, humidity)
    action = get_recommended_action(disease, confidence, rain_expected, wind_speed, humidity)
    cost_estimate = get_treatment_cost_estimate(disease)

    return {
        "severity": severity,
        "weather_risk": weather_risk,
        "recommended_action": action,
        "cost_estimate": cost_estimate,
        "farmer_message": (
            f"KrishiNayan detected {disease} with {confidence}% confidence. "
            f"Severity: {severity}. Weather risk: {weather_risk}. "
            f"Suggested action: {action}"
        )
    }


def get_treatment_cost_estimate(disease, area_acres=1):
    """
    Transparent demo estimate for common crop-care actions. Values are
    intentionally broad per-acre ranges; farmers should confirm local
    product and labour prices before buying inputs.
    """
    if not disease or disease.strip().lower() == "healthy":
        return {
            "min": 0,
            "max": 0,
            "unit": "INR/acre",
            "note": "No treatment cost estimated for a healthy scan."
        }

    disease_key = disease.strip().lower()
    base_ranges = {
        "early blight": (350, 500),
        "late blight": (450, 700),
        "leaf mold": (300, 500),
        "septoria leaf spot": (350, 550),
        "bacterial spot": (300, 550),
        "corn common rust": (350, 600),
        "maize leaf blight": (350, 650),
        "brown spot": (300, 550),
        "rice blast": (450, 750),
    }
    low, high = base_ranges.get(disease_key, (300, 650))
    multiplier = max(float(area_acres or 1), 0.1)
    return {
        "min": round(low * multiplier),
        "max": round(high * multiplier),
        "unit": "INR",
        "per_acre_min": low,
        "per_acre_max": high,
        "note": "Indicative treatment input range; verify with local KVK/officer."
    }

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

    return {
        "severity": severity,
        "weather_risk": weather_risk,
        "recommended_action": action,
        "farmer_message": (
            f"KrishiNayan detected {disease} with {confidence}% confidence. "
            f"Severity: {severity}. Weather risk: {weather_risk}. "
            f"Suggested action: {action}"
        )
    }
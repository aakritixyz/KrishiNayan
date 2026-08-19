import json
from functools import lru_cache
from pathlib import Path


DATA_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "soil_profiles.json"
)

# Optimal pH range for tomato — used to flag soil-driven stress.
TOMATO_OPTIMAL_PH_MIN = 6.0
TOMATO_OPTIMAL_PH_MAX = 6.8


@lru_cache(maxsize=1)
def load_soil_data():
    """
    Load the static soil profile dataset once and cache it.
    """
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Soil data file not found: {DATA_PATH}"
        )

    with open(DATA_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data.get("profiles", [])


def get_supported_states():
    """
    Return the sorted list of states covered by the soil dataset.
    """
    profiles = load_soil_data()
    states = sorted({profile["state"] for profile in profiles})
    return states


def get_districts_for_state(state: str):
    """
    Return the sorted list of districts covered for a given state.
    """
    profiles = load_soil_data()
    districts = sorted(
        profile["district"]
        for profile in profiles
        if profile["state"].lower() == state.lower()
    )
    return districts


def get_soil_profile(state: str, district: str):
    """
    Return the soil profile for a given state + district, or None
    if it is not covered by the dataset.
    """
    profiles = load_soil_data()

    for profile in profiles:
        if (
            profile["state"].lower() == state.lower()
            and profile["district"].lower() == district.lower()
        ):
            return profile

    return None


def _is_low(value: str) -> bool:
    return value == "Low"


def _is_high(value: str) -> bool:
    return value == "High"


def get_soil_context(disease: str, confidence: float, soil_profile: dict, rain_expected: bool = False, humidity: float = 0):
    """
    Combine the ML diagnosis with the soil profile to produce
    supporting context. This NEVER overrides the image model's
    disease/confidence output — it only adds explanatory context
    and extra recommendations.
    """
    if soil_profile is None:
        return None

    risk_factors = []
    recommendations = []

    ph = soil_profile.get("ph")
    moisture = soil_profile.get("moisture_retention", "")
    potassium = soil_profile.get("potassium", "")
    nitrogen = soil_profile.get("nitrogen", "")
    phosphorus = soil_profile.get("phosphorus", "")
    organic_carbon = soil_profile.get("organic_carbon", "")

    is_disease = disease and disease != "Healthy"
    is_confident = confidence >= 70

    # Moisture + fungal-disease interaction (Late Blight, Early Blight,
    # Septoria Leaf Spot, Leaf Mold are all moisture/humidity driven).
    if is_disease and is_confident:
        if _is_high(moisture) and (rain_expected or humidity >= 75):
            risk_factors.append(
                "High soil moisture retention combined with wet "
                "weather increases fungal spread risk"
            )
            recommendations.append(
                "Improve field drainage and avoid overhead irrigation"
            )

        if _is_low(potassium):
            risk_factors.append(
                "Low soil potassium can weaken plant disease resistance"
            )
            recommendations.append(
                "Consider a potassium-rich supplement (e.g. muriate of potash) "
                "after consulting a local agriculture officer"
            )

        if _is_low(nitrogen):
            risk_factors.append(
                "Low soil nitrogen may slow plant recovery after treatment"
            )

        if _is_low(phosphorus):
            risk_factors.append(
                "Low soil phosphorus can affect root strength and recovery"
            )

        if ph is not None and (
            ph < TOMATO_OPTIMAL_PH_MIN or ph > TOMATO_OPTIMAL_PH_MAX
        ):
            risk_factors.append(
                f"Soil pH ({ph}) is outside the ideal 6.0-6.8 range for "
                "tomato, which can add stress on top of the detected issue"
            )

        if _is_low(organic_carbon):
            recommendations.append(
                "Adding organic compost/manure can improve long-term soil "
                "health and plant resilience"
            )

    if not risk_factors:
        risk_level = "Low"
        summary = (
            "Soil conditions in this district do not show major added "
            "risk factors for the detected issue."
        )
    elif len(risk_factors) >= 2:
        risk_level = "High"
        summary = (
            "Soil conditions in this district are likely adding to the "
            "crop's risk alongside the detected issue."
        )
    else:
        risk_level = "Medium"
        summary = (
            "Soil conditions in this district may be mildly contributing "
            "to the detected issue."
        )

    return {
        "state": soil_profile["state"],
        "district": soil_profile["district"],
        "soil_type": soil_profile["soil_type"],
        "ph": ph,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "organic_carbon": organic_carbon,
        "moisture_retention": moisture,
        "soil_risk_level": risk_level,
        "soil_risk_factors": risk_factors,
        "soil_recommendations": recommendations,
        "summary": summary
    }

import requests
from datetime import datetime, timezone


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
REQUEST_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "KrishiNayan/1.0 (https://krishi-nayan.vercel.app)",
}

SUPPORTED_LANGUAGES = {"en", "hi", "pa", "mr"}

NOMINATIM_LANGUAGE_MAP = {
    "en": "en",
    "hi": "hi,en",
    "pa": "pa,en",
    "mr": "mr,en",
}

DISTRICT_COORDINATES = {
    ("delhi", "delhi"): (28.6139, 77.2090),
    ("maharashtra", "pune"): (18.5204, 73.8567),
    ("maharashtra", "nashik"): (19.9975, 73.7898),
    ("maharashtra", "nagpur"): (21.1458, 79.0882),
    ("punjab", "ludhiana"): (30.9010, 75.8573),
    ("punjab", "amritsar"): (31.6340, 74.8723),
    ("haryana", "karnal"): (29.6857, 76.9905),
    ("uttar pradesh", "lucknow"): (26.8467, 80.9462),
}


def _normalize_language(language: str | None) -> str:
    value = (language or "en").strip().lower()
    return value if value in SUPPORTED_LANGUAGES else "en"


def _first_nonempty(*values):
    for value in values:
        if value:
            return value
    return None


def get_known_coordinates(
    state: str | None,
    district: str | None,
) -> tuple[float, float] | None:
    if not state:
        return None

    state_key = state.strip().lower()
    district_key = (district or state).strip().lower()

    return (
        DISTRICT_COORDINATES.get((state_key, district_key))
        or DISTRICT_COORDINATES.get((state_key, state_key))
    )


def _estimated_weather(latitude: float, longitude: float):
    month = datetime.now(timezone.utc).month
    base_temperature = 30 - min(abs(latitude) * 0.12, 8)

    if month in {6, 7, 8, 9}:
        humidity = 74
        rain = 0.2
    elif month in {12, 1, 2}:
        humidity = 55
        rain = 0
        base_temperature -= 5
    else:
        humidity = 62
        rain = 0

    if longitude < 75 and month in {4, 5, 6}:
        base_temperature += 2

    return {
        "temperature": round(base_temperature, 1),
        "humidity": humidity,
        "wind_speed": 9.0,
        "rain": rain,
        "rain_expected": rain > 0,
        "weather_code": None,
    }


def _get_location_name(
    latitude: float,
    longitude: float,
    language: str = "en",
):
    """
    Reverse-geocode coordinates and prefer an explicitly localized
    OpenStreetMap name (name:hi/name:pa/name:mr) when available.

    accept-language alone is not reliable enough because many OSM address
    fields still come back in their default stored language.
    """
    language = _normalize_language(language)

    try:
        response = requests.get(
            NOMINATIM_URL,
            params={
                "lat": latitude,
                "lon": longitude,
                "format": "jsonv2",
                "zoom": 10,
                "addressdetails": 1,
                "namedetails": 1,
                "accept-language": NOMINATIM_LANGUAGE_MAP[language],
            },
            headers={
                "User-Agent": "KrishiNayan/1.0"
            },
            timeout=8,
        )

        response.raise_for_status()
        data = response.json()

        address = data.get("address", {})
        names = data.get("namedetails", {})

        # Prefer the exact language-tagged OSM name.
        localized_name = _first_nonempty(
            names.get(f"name:{language}"),
            names.get(language),
        )

        # Then use the localized response produced by accept-language.
        address_name = _first_nonempty(
            address.get("city"),
            address.get("town"),
            address.get("village"),
            address.get("municipality"),
            address.get("county"),
            address.get("state_district"),
            address.get("state"),
        )

        # Finally fall back to default OSM name.
        default_name = _first_nonempty(
            names.get("name"),
            data.get("name"),
        )

        return _first_nonempty(
            localized_name,
            address_name,
            default_name,
        )

    except requests.RequestException:
        return None


def get_weather_data(
    latitude=None,
    longitude=None,
    language: str = "en",
):
    """
    Fetch current weather from Open-Meteo and return a best-effort
    localized location name.
    """
    language = _normalize_language(language)

    if latitude is None or longitude is None:
        return {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": None,
            "humidity": None,
            "wind_speed": None,
            "rain": None,
            "rain_expected": False,
            "weather_code": None,
            "location_name": None,
            "language": language,
            "source": "Location unavailable",
        }

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,relative_humidity_2m,precipitation,"
            "wind_speed_10m,weather_code"
        ),
        "timezone": "auto",
    }

    try:
        response = requests.get(
            OPEN_METEO_URL,
            params=params,
            timeout=10,
        )
        response.raise_for_status()

        data = response.json()
        current = data.get("current", {})
        rain_value = current.get("precipitation", 0) or 0

        return {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "wind_speed": current.get("wind_speed_10m"),
            "rain": rain_value,
            "rain_expected": rain_value > 0,
            "weather_code": current.get("weather_code"),
            "location_name": _get_location_name(
                latitude,
                longitude,
                language,
            ),
            "language": language,
            "source": "Open-Meteo",
        }

    except requests.RequestException:
        estimated = _estimated_weather(latitude, longitude)
        return {
            "latitude": latitude,
            "longitude": longitude,
            **estimated,
            "location_name": _get_location_name(
                latitude,
                longitude,
                language,
            ),
            "language": language,
            "source": "Estimated weather",
        }

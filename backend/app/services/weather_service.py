import requests


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"

SUPPORTED_LANGUAGES = {"en", "hi", "pa", "mr"}

NOMINATIM_LANGUAGE_MAP = {
    "en": "en",
    "hi": "hi,en",
    "pa": "pa,en",
    "mr": "mr,en",
}


def _normalize_language(language: str | None) -> str:
    value = (language or "en").strip().lower()
    return value if value in SUPPORTED_LANGUAGES else "en"


def _first_nonempty(*values):
    for value in values:
        if value:
            return value
    return None


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
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "rain",
            "wind_speed_10m",
            "weather_code",
        ],
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
        rain_value = current.get("rain", 0) or 0

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
        return {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": None,
            "humidity": None,
            "wind_speed": None,
            "rain": None,
            "rain_expected": False,
            "weather_code": None,
            "location_name": _get_location_name(
                latitude,
                longitude,
                language,
            ),
            "language": language,
            "source": "Weather unavailable",
        }

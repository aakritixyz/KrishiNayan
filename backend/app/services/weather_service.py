import requests


def get_weather_data(latitude=None, longitude=None):
    """
    Fetch current weather using Open-Meteo.
    If latitude/longitude are not provided, use Delhi as default demo location.
    """

    if latitude is None:
        latitude = 28.6139

    if longitude is None:
        longitude = 77.2090

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "rain",
            "wind_speed_10m"
        ]
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()
        current = data.get("current", {})

        rain_value = current.get("rain", 0)
        humidity = current.get("relative_humidity_2m", 0)
        wind_speed = current.get("wind_speed_10m", 0)
        temperature = current.get("temperature_2m", 0)

        rain_expected = rain_value > 0

        return {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "rain": rain_value,
            "rain_expected": rain_expected,
            "source": "Open-Meteo"
        }

    except requests.RequestException:
        return {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": None,
            "humidity": 72,
            "wind_speed": 8,
            "rain": 0,
            "rain_expected": False,
            "source": "Fallback demo weather"
        }
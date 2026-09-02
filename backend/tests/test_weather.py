import requests

from app.services import weather_service


def test_weather_falls_back_to_estimate_when_provider_fails(monkeypatch):
    def fail_request(*args, **kwargs):
        raise requests.Timeout("weather provider timed out")

    monkeypatch.setattr(weather_service.requests, "get", fail_request)

    data = weather_service.get_weather_data(18.5204, 73.8567)

    assert data["source"] == "Estimated weather"
    assert data["temperature"] is not None
    assert data["humidity"] is not None
    assert data["wind_speed"] is not None
    assert "provider_error" in data


def test_weather_uses_open_meteo_current_parameter_shape(monkeypatch):
    captured = {}

    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "current": {
                    "temperature_2m": 27.8,
                    "relative_humidity_2m": 70,
                    "rain": 0.1,
                    "wind_speed_10m": 19.1,
                    "weather_code": 51,
                }
            }

    def fake_request(url, **kwargs):
        captured["url"] = url
        captured.update(kwargs)
        return Response()

    monkeypatch.setattr(weather_service.requests, "get", fake_request)
    monkeypatch.setattr(weather_service, "_get_location_name", lambda *args: "Pune")

    data = weather_service.get_weather_data(18.5204, 73.8567)

    assert data["source"] == "Open-Meteo"
    assert captured["url"] == weather_service.OPEN_METEO_URL
    assert captured["params"]["current"] == (
        "temperature_2m,relative_humidity_2m,rain,"
        "precipitation,wind_speed_10m,weather_code"
    )
    assert captured["headers"]["Accept"] == "application/json"


def test_known_coordinates_resolve_demo_districts():
    assert weather_service.get_known_coordinates(
        "Maharashtra",
        "Pune",
    ) == (18.5204, 73.8567)

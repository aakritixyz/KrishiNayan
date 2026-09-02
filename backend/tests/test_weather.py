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


def test_known_coordinates_resolve_demo_districts():
    assert weather_service.get_known_coordinates(
        "Maharashtra",
        "Pune",
    ) == (18.5204, 73.8567)

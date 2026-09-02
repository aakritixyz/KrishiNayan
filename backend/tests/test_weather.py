import requests
import pytest

from app.services import weather_service


@pytest.fixture(autouse=True)
def clear_weather_caches():
    weather_service._LIVE_WEATHER_CACHE.clear()
    weather_service._LOCATION_NAME_CACHE.clear()
    yield
    weather_service._LIVE_WEATHER_CACHE.clear()
    weather_service._LOCATION_NAME_CACHE.clear()


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
    assert data["weather_service_version"] == weather_service.WEATHER_SERVICE_VERSION


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
    assert data["cache_status"] == "live"
    assert captured["url"] == weather_service.OPEN_METEO_URL
    assert captured["params"]["current"] == (
        "temperature_2m,relative_humidity_2m,rain,"
        "precipitation,wind_speed_10m,weather_code"
    )
    assert captured["headers"]["Accept"] == "application/json"


def test_weather_reuses_fresh_open_meteo_cache(monkeypatch):
    calls = []

    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "current": {
                    "temperature_2m": 26.4,
                    "relative_humidity_2m": 78,
                    "rain": 0,
                    "wind_speed_10m": 8.5,
                    "weather_code": 2,
                }
            }

    def fake_request(url, **kwargs):
        calls.append(url)
        return Response()

    monkeypatch.setattr(weather_service.requests, "get", fake_request)
    monkeypatch.setattr(weather_service, "_get_location_name", lambda *args: "Pune")

    first = weather_service.get_weather_data(18.5204, 73.8567)
    second = weather_service.get_weather_data(18.5205, 73.8568)

    assert first["source"] == "Open-Meteo"
    assert first["cache_status"] == "live"
    assert second["source"] == "Open-Meteo"
    assert second["cache_status"] == "fresh"
    assert second["temperature"] == 26.4
    assert calls == [weather_service.OPEN_METEO_URL]


def test_weather_uses_stale_open_meteo_cache_after_rate_limit(monkeypatch):
    weather_service._cache_live_weather(
        18.5204,
        73.8567,
        {
            "temperature": 25.9,
            "humidity": 80,
            "wind_speed": 7.0,
            "rain": 0,
            "rain_expected": False,
            "weather_code": 3,
        },
    )
    key = weather_service._weather_cache_key(18.5204, 73.8567)
    fetched_at, payload = weather_service._LIVE_WEATHER_CACHE[key]
    weather_service._LIVE_WEATHER_CACHE[key] = (
        fetched_at - weather_service.LIVE_WEATHER_CACHE_TTL,
        payload,
    )

    def fail_request(*args, **kwargs):
        raise requests.HTTPError("429 Client Error: Too Many Requests")

    monkeypatch.setattr(weather_service.requests, "get", fail_request)
    monkeypatch.setattr(weather_service, "_get_location_name", lambda *args: "Pune")

    data = weather_service.get_weather_data(18.5204, 73.8567)

    assert data["source"] == "Open-Meteo"
    assert data["cache_status"] == "stale"
    assert data["temperature"] == 25.9
    assert "429 Client Error" in data["provider_error"]


def test_known_coordinates_resolve_demo_districts():
    assert weather_service.get_known_coordinates(
        "Maharashtra",
        "Pune",
    ) == (18.5204, 73.8567)

from fastapi.testclient import TestClient

import app.routes.predict as predict_route
from main import app


client = TestClient(app)


def test_root_route():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "KrishiNayan backend running"
    }


def test_health_route():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_predict_route(monkeypatch):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes: {
            "disease": "Early Blight",
            "confidence": 99.81,
            "status": "supported",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_weather_data",
        lambda latitude=None, longitude=None: {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": 27.0,
            "humidity": 82,
            "wind_speed": 18,
            "rain": 1,
            "rain_expected": True,
            "source": "Open-Meteo",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_farmer_message",
        lambda **kwargs: {
            "severity": "Medium",
            "weather_risk": "Rain expected",
            "recommended_action": (
                "Avoid spraying today. Spray tomorrow morning "
                "if weather is clear."
            ),
            "farmer_message": (
                "Aapke tomato plant mein Early Blight ke signs "
                "dikh rahe hain."
            ),
        },
    )

    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: (
            "backend/uploads/test_leaf.jpg"
        ),
    )

    response = client.post(
        "/predict",
        files={
            "file": (
                "test_leaf.jpg",
                b"fake-image-bytes",
                "image/jpeg",
            )
        },
        data={
            "latitude": "28.6139",
            "longitude": "77.2090",
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["crop"] == "Tomato"
    assert result["detected_issue"] == "Early Blight"
    assert result["confidence"] == 99.81
    assert result["saved_image_path"] == (
        "backend/uploads/test_leaf.jpg"
    )
    assert result["weather"]["source"] == "Open-Meteo"
    assert result["severity"] == "Medium"


def test_predict_rejects_unsupported_file():
    response = client.post(
        "/predict",
        files={
            "file": (
                "notes.txt",
                b"not-an-image",
                "text/plain",
            )
        },
    )

    assert response.status_code == 415
from fastapi.testclient import TestClient

import app.routes.predict as predict_route
from main import app


client = TestClient(app)


def _register(email):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Feature Test Farmer",
            "email": email,
            "password": "Farmer@123",
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _mock_prediction(monkeypatch, disease="Early Blight", confidence=91.0):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "status": "supported",
        },
    )
    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": None,
    )
    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: "backend/uploads/feature_leaf.jpg",
    )
    monkeypatch.setattr(
        predict_route,
        "get_weather_data",
        lambda latitude=None, longitude=None: {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": 27.0,
            "humidity": 72,
            "wind_speed": 6,
            "rain": 0,
            "rain_expected": False,
            "source": "Test weather",
        },
    )


def test_farmer_can_create_and_list_plots():
    headers = _register("features.plots@example.com")

    created = client.post(
        "/plots",
        headers=headers,
        json={
            "name": "North Plot",
            "crop": "tomato",
            "growth_stage": "Flowering",
            "area_acres": 1.5,
            "state": "Maharashtra",
            "district": "Pune",
            "latitude": 18.5204,
            "longitude": 73.8567,
        },
    )

    assert created.status_code == 201
    assert created.json()["plot"]["crop_label"] == "Tomato"

    listed = client.get("/plots", headers=headers)
    assert listed.status_code == 200
    assert listed.json()["plots"][0]["name"] == "North Plot"


def test_prediction_links_plot_and_creates_recovery_plan(monkeypatch):
    headers = _register("features.recovery@example.com")
    _mock_prediction(monkeypatch)

    plot = client.post(
        "/plots",
        headers=headers,
        json={
            "name": "Recovery Plot",
            "crop": "tomato",
            "state": "Maharashtra",
            "district": "Pune",
            "area_acres": 2,
        },
    ).json()["plot"]

    response = client.post(
        "/predict",
        headers=headers,
        data={"plot_id": str(plot["id"])},
        files={
            "file": (
                "leaf.jpg",
                b"fake-image-bytes",
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["health"]["field_label"] == "Recovery Plot"
    assert result["cost_estimate"]["min"] >= 700
    assert result["recovery"]["tasks"]

    latest = client.get("/recovery/latest", headers=headers)
    assert latest.status_code == 200
    assert latest.json()["plan"]["id"] == result["recovery"]["id"]


def test_nearby_alerts_are_generated_from_scan_records(monkeypatch):
    headers = _register("features.alerts@example.com")
    _mock_prediction(monkeypatch, disease="Late Blight", confidence=88.0)

    response = client.post(
        "/predict",
        headers=headers,
        data={
            "crop": "tomato",
            "state": "Maharashtra",
            "district": "Pune",
            "latitude": "18.5204",
            "longitude": "73.8567",
        },
        files={
            "file": (
                "leaf.jpg",
                b"fake-image-bytes",
                "image/jpeg",
            )
        },
    )
    assert response.status_code == 200

    alerts = client.get(
        "/alerts/nearby",
        headers=headers,
        params={"latitude": 18.5204, "longitude": 73.8567},
    )

    assert alerts.status_code == 200
    body = alerts.json()
    assert body["summary"]["case_count"] >= 1
    assert body["cases"][0]["disease"] == "Late Blight"

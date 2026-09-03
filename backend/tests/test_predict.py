from fastapi.testclient import TestClient
from PIL import Image

import app.routes.predict as predict_route
from app.services.ml_service import estimate_leaf_image_quality
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
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
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


def test_leaf_quality_guard_rejects_non_leaf_photo():
    image = Image.new("RGB", (220, 220), (214, 164, 126))

    quality = estimate_leaf_image_quality(image)

    assert quality["is_likely_leaf"] is False


def test_leaf_quality_guard_accepts_leaf_like_photo():
    image = Image.new("RGB", (220, 220), (58, 132, 47))

    quality = estimate_leaf_image_quality(image)

    assert quality["is_likely_leaf"] is True


def test_predict_without_soil_fields_returns_none_soil_context(
    monkeypatch,
):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Healthy",
            "confidence": 95.0,
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
            "humidity": 50,
            "wind_speed": 5,
            "rain": 0,
            "rain_expected": False,
            "source": "Open-Meteo",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_farmer_message",
        lambda **kwargs: {
            "severity": "Low",
            "weather_risk": "Low weather risk",
            "recommended_action": "Continue regular monitoring.",
            "farmer_message": "Crop looks healthy.",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: "backend/uploads/test_leaf.jpg",
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
    )

    assert response.status_code == 200
    assert response.json()["soil_context"] is None


def test_predict_includes_gradcam_image_when_available(monkeypatch):
    monkeypatch.setattr(predict_route, "ENABLE_GRADCAM", True)
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Early Blight",
            "confidence": 91.2,
            "status": "supported",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_weather_data",
        lambda latitude=None, longitude=None: {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": 26.0,
            "humidity": 60,
            "wind_speed": 10,
            "rain": 0,
            "rain_expected": False,
            "source": "Open-Meteo",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_farmer_message",
        lambda **kwargs: {
            "severity": "Medium",
            "weather_risk": "Low weather risk",
            "recommended_action": "Spray in the morning.",
            "farmer_message": "Early Blight detected.",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: "backend/uploads/test_leaf.jpg",
    )

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": {
            "disease": "Early Blight",
            "confidence": 91.2,
            "heatmap_image": "data:image/png;base64,FAKE",
        },
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
    )

    assert response.status_code == 200
    assert response.json()["gradcam_image"] == (
        "data:image/png;base64,FAKE"
    )


def test_predict_skips_gradcam_when_disabled(monkeypatch):
    monkeypatch.setattr(predict_route, "ENABLE_GRADCAM", False)
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Early Blight",
            "confidence": 91.2,
            "status": "supported",
        },
    )
    monkeypatch.setattr(
        predict_route,
        "get_weather_data",
        lambda latitude=None, longitude=None: {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": 26.0,
            "humidity": 60,
            "wind_speed": 10,
            "rain": 0,
            "rain_expected": False,
            "source": "Open-Meteo",
        },
    )
    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: "backend/uploads/test_leaf.jpg",
    )

    def fail_gradcam(*args, **kwargs):
        raise AssertionError("Grad-CAM should not run when disabled")

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        fail_gradcam,
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
    )

    assert response.status_code == 200
    assert response.json()["gradcam_image"] is None


def test_predict_gradcam_failure_returns_null_image(monkeypatch):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Healthy",
            "confidence": 98.0,
            "status": "supported",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_weather_data",
        lambda latitude=None, longitude=None: {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": 26.0,
            "humidity": 60,
            "wind_speed": 10,
            "rain": 0,
            "rain_expected": False,
            "source": "Open-Meteo",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_farmer_message",
        lambda **kwargs: {
            "severity": "Low",
            "weather_risk": "Low weather risk",
            "recommended_action": "Continue monitoring.",
            "farmer_message": "Crop looks healthy.",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: "backend/uploads/test_leaf.jpg",
    )

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": None,
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
    )

    assert response.status_code == 200
    assert response.json()["gradcam_image"] is None


def test_crops_endpoint_lists_all_crops():
    response = client.get("/crops")

    assert response.status_code == 200

    crop_ids = [c["id"] for c in response.json()["crops"]]

    assert crop_ids == ["tomato", "maize", "rice"]


def test_predict_defaults_to_tomato_crop(monkeypatch):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Healthy",
            "confidence": 95.0,
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
            "humidity": 50,
            "wind_speed": 5,
            "rain": 0,
            "rain_expected": False,
            "source": "Open-Meteo",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "get_farmer_message",
        lambda **kwargs: {
            "severity": "Low",
            "weather_risk": "Low weather risk",
            "recommended_action": "Continue monitoring.",
            "farmer_message": "Crop looks healthy.",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "save_uploaded_image",
        lambda filename, image_bytes: "backend/uploads/test_leaf.jpg",
    )

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": None,
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
    )

    assert response.status_code == 200
    assert response.json()["crop"] == "Tomato"


def test_soil_states_endpoint():
    response = client.get("/soil/states")

    assert response.status_code == 200

    states = response.json()["states"]

    assert "Punjab" in states
    assert "Bihar" in states
    assert "Haryana" in states
    assert "Maharashtra" in states
    assert "Uttar Pradesh" in states


def test_soil_districts_endpoint():
    response = client.get("/soil/districts", params={"state": "Punjab"})

    assert response.status_code == 200
    assert "Ludhiana" in response.json()["districts"]


def test_soil_districts_endpoint_unknown_state():
    response = client.get("/soil/districts", params={"state": "Kerala"})

    assert response.status_code == 404


def test_soil_profile_endpoint():
    response = client.get(
        "/soil/profile",
        params={"state": "Punjab", "district": "Ludhiana"},
    )

    assert response.status_code == 200
    assert response.json()["soil_type"] == "Alluvial"


def test_predict_uses_logged_in_profile_state_when_not_supplied(
    monkeypatch,
):
    """
    When a logged-in farmer doesn't pick a state/district on the
    scan form, /predict should fall back to what's saved on their
    profile instead of skipping the soil-context lookup.
    """
    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Predict Test Farmer",
            "email": "predict.profile@example.com",
            "password": "Farmer@123",
        },
    )
    token = register_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.put(
        "/profile",
        headers=headers,
        json={"state": "Punjab", "district": "Ludhiana"},
    )

    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Healthy",
            "confidence": 95.0,
            "status": "supported",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": None,
    )

    response = client.post(
        "/predict",
        headers=headers,
        files={
            "file": (
                "test_leaf.jpg",
                b"fake-image-bytes",
                "image/jpeg",
            )
        },
    )

    assert response.status_code == 200
    # Punjab/Ludhiana is real soil-profile data (see test_soil_profile_endpoint
    # above), so a non-null soil_context proves the profile's saved
    # state/district reached the soil lookup without being typed in.
    assert response.json()["soil_context"] is not None


def test_predict_still_works_without_login(monkeypatch):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": "Healthy",
            "confidence": 95.0,
            "status": "supported",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": None,
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
    )

    assert response.status_code == 200

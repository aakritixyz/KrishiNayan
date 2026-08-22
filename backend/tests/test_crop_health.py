import app.routes.predict as predict_route

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def _register_and_get_token(email):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Health Test Farmer",
            "email": email,
            "password": "Farmer@123"
        }
    )

    return response.json()["access_token"]


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def _mock_scan(monkeypatch, disease, confidence):
    monkeypatch.setattr(
        predict_route,
        "predict_disease",
        lambda image_bytes, crop="tomato": {
            "crop": "tomato",
            "disease": disease,
            "confidence": confidence,
            "status": "supported" if confidence >= 70 else "uncertain",
        },
    )

    monkeypatch.setattr(
        predict_route,
        "generate_gradcam_overlay",
        lambda image_bytes, crop="tomato": None,
    )


def _post_scan(headers, field_label=None):
    data = {}

    if field_label:
        data["field_label"] = field_label

    return client.post(
        "/predict",
        headers=headers,
        data=data,
        files={
            "file": (
                "leaf.jpg",
                b"fake-image-bytes",
                "image/jpeg",
            )
        },
    )


def test_health_overview_requires_authentication():
    response = client.get("/crop-health/overview")

    assert response.status_code == 401


def test_health_overview_empty_for_new_user():
    token = _register_and_get_token("health.empty@example.com")

    response = client.get(
        "/crop-health/overview",
        headers=_auth_headers(token)
    )

    assert response.status_code == 200
    assert response.json()["crops"] == []


def test_first_scan_has_no_previous_comparison(monkeypatch):
    token = _register_and_get_token("health.first@example.com")
    _mock_scan(monkeypatch, "Early Blight", 91.0)

    response = _post_scan(_auth_headers(token))

    assert response.status_code == 200

    health = response.json()["health"]

    assert health is not None
    assert health["previous_health_score"] is None
    assert health["point_change"] is None
    assert health["trend"] == "insufficient_data"
    # Diseased diagnosis: score is the inverse of disease confidence.
    assert health["health_score"] == 9.0


def test_second_scan_shows_real_point_and_percent_change(monkeypatch):
    token = _register_and_get_token("health.second@example.com")
    headers = _auth_headers(token)

    _mock_scan(monkeypatch, "Early Blight", 90.0)
    first = _post_scan(headers)
    first_score = first.json()["health"]["health_score"]

    _mock_scan(monkeypatch, "Healthy", 95.0)
    second = _post_scan(headers)
    second_health = second.json()["health"]

    assert second_health["previous_health_score"] == first_score
    assert second_health["health_score"] == 95.0

    expected_point_change = round(95.0 - first_score, 1)
    assert second_health["point_change"] == expected_point_change

    expected_percent_change = round(
        (expected_point_change / first_score) * 100, 1
    )
    assert second_health["percent_change"] == expected_percent_change
    assert second_health["trend"] == "improving"


def test_overview_groups_by_crop_and_field(monkeypatch):
    token = _register_and_get_token("health.fields@example.com")
    headers = _auth_headers(token)

    _mock_scan(monkeypatch, "Early Blight", 88.0)
    _post_scan(headers, field_label="North Plot")

    _mock_scan(monkeypatch, "Healthy", 97.0)
    _post_scan(headers, field_label="South Plot")

    response = client.get("/crop-health/overview", headers=headers)

    assert response.status_code == 200

    crops = response.json()["crops"]
    field_labels = {item["field_label"] for item in crops}

    assert field_labels == {"North Plot", "South Plot"}

    for item in crops:
        assert item["scan_count"] == 1
        assert len(item["history"]) == 1
        assert item["next_estimate"] is None  # not enough history yet


def test_next_estimate_appears_after_enough_scans(monkeypatch):
    token = _register_and_get_token("health.trend@example.com")
    headers = _auth_headers(token)

    # Three consecutive improving scans of the same crop/field.
    for confidence in (60.0, 40.0, 20.0):
        _mock_scan(monkeypatch, "Early Blight", confidence)
        _post_scan(headers, field_label="Trend Field")

    response = client.get("/crop-health/overview", headers=headers)
    crops = response.json()["crops"]

    assert len(crops) == 1
    group = crops[0]

    assert group["scan_count"] == 3
    assert group["next_estimate"] is not None
    assert group["next_estimate"]["direction"] == "improving"
    assert 0 <= group["next_estimate"]["projected_next_score"] <= 100


def test_anonymous_scans_are_not_recorded(monkeypatch):
    _mock_scan(monkeypatch, "Healthy", 90.0)

    response = _post_scan(headers={})

    assert response.status_code == 200
    assert response.json()["health"] is None

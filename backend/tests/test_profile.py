from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def _register_and_get_token(email):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Ramesh Patil",
            "email": email,
            "password": "Farmer@123"
        }
    )

    return response.json()["access_token"]


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_profile_requires_authentication():
    response = client.get("/profile")

    assert response.status_code == 401


def test_new_profile_is_incomplete_with_missing_fields():
    token = _register_and_get_token("profile.new@example.com")

    response = client.get("/profile", headers=_auth_headers(token))

    assert response.status_code == 200

    body = response.json()

    assert body["profile_completed"] is False
    assert "state" in body["missing_fields"]
    assert body["completion_percent"] < 100


def test_editing_profile_updates_fields_and_completion():
    token = _register_and_get_token("profile.edit@example.com")

    response = client.put(
        "/profile",
        headers=_auth_headers(token),
        json={
            "state": "Maharashtra",
            "district": "Pune",
            "village": "Wagholi",
            "farm_size_acres": 3.5,
            "crops": ["Tomato", "Onion"],
            "irrigation_type": "drip",
            "language": "hi"
        }
    )

    assert response.status_code == 200

    body = response.json()

    assert body["state"] == "Maharashtra"
    assert body["crops"] == ["Tomato", "Onion"]
    assert body["profile_completed"] is True
    assert body["completion_percent"] == 100
    assert body["missing_fields"] == []


def test_editing_profile_rejects_unsupported_irrigation_type():
    token = _register_and_get_token("profile.badirrigation@example.com")

    response = client.put(
        "/profile",
        headers=_auth_headers(token),
        json={"irrigation_type": "magic"}
    )

    assert response.status_code == 422


def test_verify_identity_mock_flow_never_exposes_aadhaar():
    token = _register_and_get_token("profile.verify@example.com")

    response = client.post(
        "/profile/verify-identity",
        headers=_auth_headers(token)
    )

    assert response.status_code == 200

    body = response.json()

    assert body["identity_verification_status"] == "verified"
    assert body["identity_verification_provider"] == "mock-prototype"

    # The mock reference must be an opaque token, never anything
    # that looks like a real 12-digit Aadhaar number.
    reference = body["identity_verification_reference"]
    assert reference.startswith("MOCK-")
    assert not reference.isdigit()

    profile_response = client.get(
        "/profile",
        headers=_auth_headers(token)
    )

    assert (
        profile_response.json()["identity_verification_status"]
        == "verified"
    )

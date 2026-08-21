from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def _register(email, password="Farmer@123", phone=None):
    return client.post(
        "/auth/register",
        json={
            "full_name": "Bhumi Saxena",
            "email": email,
            "phone": phone,
            "password": password
        }
    )


def test_register_creates_user_and_returns_token():
    response = _register("bhumi.register@example.com")

    assert response.status_code == 201

    body = response.json()

    assert body["access_token"]
    assert body["user"]["email"] == "bhumi.register@example.com"
    assert body["user"]["profile_completed"] is False
    assert (
        body["user"]["identity_verification_status"]
        == "not_started"
    )


def test_register_rejects_short_password():
    response = _register(
        "weakpass@example.com",
        password="short1"
    )

    assert response.status_code == 422


def test_register_rejects_all_digit_password():
    response = _register(
        "digitsonly@example.com",
        password="12345678"
    )

    assert response.status_code == 422


def test_register_requires_email_or_phone():
    response = client.post(
        "/auth/register",
        json={
            "full_name": "No Contact",
            "password": "Farmer@123"
        }
    )

    assert response.status_code == 422


def test_duplicate_email_registration_is_rejected():
    _register("duplicate@example.com")
    response = _register("duplicate@example.com")

    assert response.status_code == 400


def test_login_with_correct_credentials():
    _register("login.success@example.com", password="Farmer@123")

    response = client.post(
        "/auth/login",
        json={
            "identifier": "login.success@example.com",
            "password": "Farmer@123"
        }
    )

    assert response.status_code == 200
    assert response.json()["access_token"]


def test_login_with_wrong_password_is_rejected():
    _register("login.wrong@example.com", password="Farmer@123")

    response = client.post(
        "/auth/login",
        json={
            "identifier": "login.wrong@example.com",
            "password": "WrongPass1"
        }
    )

    assert response.status_code == 401


def test_me_requires_authentication():
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user_with_valid_token():
    register_response = _register("me.check@example.com")
    token = register_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json()["email"] == "me.check@example.com"


def test_me_rejects_garbage_token():
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer not-a-real-token"}
    )

    assert response.status_code == 401

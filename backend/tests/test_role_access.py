from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def register_farmer(email: str):
    return client.post(
        "/auth/register",
        json={
            "full_name": "Role Test Farmer",
            "email": email,
            "password": "Farmer@123",
        },
    )


def test_farmer_cannot_access_officer_overview():
    registered = register_farmer("role.guard@example.com")
    assert registered.status_code == 201
    token = registered.json()["access_token"]
    response = client.get(
        "/officer/overview",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_guest_cannot_access_officer_overview():
    response = client.get("/officer/overview")
    assert response.status_code == 401


def test_guest_cannot_access_farmer_profile():
    response = client.get("/profile")
    assert response.status_code == 401

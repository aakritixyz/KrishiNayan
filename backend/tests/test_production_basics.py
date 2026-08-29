from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.services import storage_service
from app.services.rate_limit_service import _REQUESTS
from app.services.rate_limit_service import rate_limit


def test_rate_limit_headers_are_returned(monkeypatch):
    monkeypatch.delenv("KRISHINAYAN_DISABLE_RATE_LIMIT", raising=False)
    _REQUESTS.clear()

    app = FastAPI()

    @app.get("/limited")
    def limited(_limited: None = Depends(rate_limit(limit=2, window_seconds=60))):
        return {"ok": True}

    client = TestClient(app)

    first = client.get("/limited")
    assert first.status_code == 200
    assert first.headers["X-RateLimit-Limit"] == "2"
    assert first.headers["X-RateLimit-Remaining"] == "1"

    second = client.get("/limited")
    assert second.status_code == 200
    assert second.headers["X-RateLimit-Remaining"] == "0"

    third = client.get("/limited")
    assert third.status_code == 429
    assert third.headers["Retry-After"]
    assert third.headers["X-RateLimit-Remaining"] == "0"


def test_storage_status_reports_supabase_configuration(monkeypatch):
    monkeypatch.setattr(storage_service, "STORAGE_BACKEND", "supabase")
    monkeypatch.setattr(storage_service, "SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setattr(storage_service, "SUPABASE_SERVICE_ROLE_KEY", "service-key")
    monkeypatch.setattr(storage_service, "SUPABASE_STORAGE_BUCKET", "crop-scans")
    monkeypatch.setattr(storage_service, "SUPABASE_STORAGE_PUBLIC", False)

    assert storage_service.storage_status() == {
        "backend": "supabase",
        "configured": True,
        "bucket": "crop-scans",
        "public_urls": False,
    }


def test_supabase_storage_requires_credentials(monkeypatch):
    monkeypatch.setattr(storage_service, "STORAGE_BACKEND", "supabase")
    monkeypatch.setattr(storage_service, "SUPABASE_URL", "")
    monkeypatch.setattr(storage_service, "SUPABASE_SERVICE_ROLE_KEY", "")

    try:
        storage_service.save_uploaded_image("leaf.jpg", b"image")
    except RuntimeError as error:
        assert "SUPABASE_URL" in str(error)
    else:
        raise AssertionError("Expected missing Supabase credentials to fail")

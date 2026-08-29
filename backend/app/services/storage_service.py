from datetime import datetime
import os
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


STORAGE_BACKEND = os.getenv("KRISHINAYAN_STORAGE_BACKEND", "local").strip().lower()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
SUPABASE_STORAGE_BUCKET = os.getenv(
    "SUPABASE_STORAGE_BUCKET",
    "crop-scans"
).strip()
SUPABASE_STORAGE_PUBLIC = os.getenv(
    "SUPABASE_STORAGE_PUBLIC",
    "false"
).strip().lower() in {"1", "true", "yes", "on"}
UPLOAD_DIR = Path(
    os.getenv(
        "KRISHINAYAN_UPLOAD_DIR",
        str(Path(__file__).resolve().parents[2] / "uploads")
    )
).expanduser()

if STORAGE_BACKEND == "local":
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _safe_object_name(filename: str | None) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    original_filename = filename or "uploaded_image"
    safe_filename = Path(original_filename).name.replace(" ", "_")
    return f"crop-scans/{timestamp}_{safe_filename}"


def _save_local(filename: str | None, image_bytes: bytes) -> str:
    object_name = _safe_object_name(filename)
    output_path = UPLOAD_DIR / Path(object_name).name

    with open(output_path, "wb") as file:
        file.write(image_bytes)

    return str(output_path)


def _save_supabase(filename: str | None, image_bytes: bytes) -> str:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "Supabase storage is selected, but SUPABASE_URL and "
            "SUPABASE_SERVICE_ROLE_KEY are required."
        )
    if not SUPABASE_STORAGE_BUCKET:
        raise RuntimeError("SUPABASE_STORAGE_BUCKET is required.")

    object_name = _safe_object_name(filename)
    encoded_bucket = quote(SUPABASE_STORAGE_BUCKET, safe="")
    encoded_object = quote(object_name, safe="/")
    upload_url = (
        f"{SUPABASE_URL}/storage/v1/object/"
        f"{encoded_bucket}/{encoded_object}"
    )

    request = Request(
        upload_url,
        data=image_bytes,
        method="POST",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/octet-stream",
            "x-upsert": "false",
        },
    )

    try:
        with urlopen(request, timeout=20):
            pass
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Supabase storage upload failed ({error.code}): {detail}"
        ) from error
    except URLError as error:
        raise RuntimeError(
            f"Supabase storage upload failed: {error.reason}"
        ) from error

    if SUPABASE_STORAGE_PUBLIC:
        return (
            f"{SUPABASE_URL}/storage/v1/object/public/"
            f"{encoded_bucket}/{encoded_object}"
        )

    return f"supabase://{SUPABASE_STORAGE_BUCKET}/{object_name}"


def storage_status() -> dict:
    configured = STORAGE_BACKEND == "local" or bool(
        SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET
    )
    return {
        "backend": STORAGE_BACKEND,
        "configured": configured,
        "bucket": SUPABASE_STORAGE_BUCKET if STORAGE_BACKEND == "supabase" else None,
        "public_urls": SUPABASE_STORAGE_PUBLIC if STORAGE_BACKEND == "supabase" else None,
    }


def save_uploaded_image(filename: str | None, image_bytes: bytes) -> str:
    if STORAGE_BACKEND == "local":
        return _save_local(filename, image_bytes)

    if STORAGE_BACKEND == "supabase":
        return _save_supabase(filename, image_bytes)

    else:
        raise RuntimeError(
            "Unsupported storage backend "
            f"{STORAGE_BACKEND}."
        )

from datetime import datetime
import os
from pathlib import Path


STORAGE_BACKEND = os.getenv("KRISHINAYAN_STORAGE_BACKEND", "local").strip().lower()
UPLOAD_DIR = Path(
    os.getenv(
        "KRISHINAYAN_UPLOAD_DIR",
        str(Path(__file__).resolve().parents[2] / "uploads")
    )
).expanduser()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_image(filename: str | None, image_bytes: bytes) -> str:
    if STORAGE_BACKEND != "local":
        raise RuntimeError(
            "Only local storage is configured. Set up a production storage "
            "adapter before using KRISHINAYAN_STORAGE_BACKEND="
            f"{STORAGE_BACKEND}."
        )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    original_filename = filename or "uploaded_image"
    safe_filename = Path(original_filename).name.replace(" ", "_")

    output_path = UPLOAD_DIR / f"{timestamp}_{safe_filename}"

    with open(output_path, "wb") as file:
        file.write(image_bytes)

    return str(output_path)

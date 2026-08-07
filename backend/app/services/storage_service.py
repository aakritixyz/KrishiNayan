from datetime import datetime
from pathlib import Path


UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_image(filename: str | None, image_bytes: bytes) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

    original_filename = filename or "uploaded_image"
    safe_filename = Path(original_filename).name.replace(" ", "_")

    output_path = UPLOAD_DIR / f"{timestamp}_{safe_filename}"

    with open(output_path, "wb") as file:
        file.write(image_bytes)

    return str(output_path)
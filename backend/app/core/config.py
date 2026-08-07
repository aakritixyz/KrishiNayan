import os

from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]

DEFAULT_MODEL_PATH = (
    BACKEND_DIR
    / "models"
    / "KrishiNayan_Tomato_EfficientNetB0.keras"
)

MODEL_PATH = Path(
    os.getenv(
        "KRISHINAYAN_MODEL_PATH",
        str(DEFAULT_MODEL_PATH)
    )
).expanduser()

CLASS_NAMES_PATH = (
    BACKEND_DIR
    / "models"
    / "class_names.json"
)

IMAGE_SIZE = (224, 224)

CONFIDENCE_THRESHOLD = 0.70

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

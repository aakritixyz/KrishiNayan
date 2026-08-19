import os

from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = BACKEND_DIR / "models"

DEFAULT_CROP = "tomato"

# Each crop points to its own model file + class names file.
# Tomato keeps its original (pre-multi-crop) file locations so
# nothing breaks for the existing model. New crops live in their
# own subfolder under models/ — drop a trained .keras file and a
# class_names.json there and it works automatically.
CROP_CONFIG = {
    "tomato": {
        "label": "Tomato",
        "model_path": MODELS_DIR / "KrishiNayan_Tomato_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "class_names.json",
    },
    "maize": {
        "label": "Maize",
        "model_path": MODELS_DIR / "maize" / "KrishiNayan_Maize_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "maize" / "class_names.json",
    },
    "rice": {
        "label": "Rice",
        "model_path": MODELS_DIR / "rice" / "KrishiNayan_Rice_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "rice" / "class_names.json",
    },
    "wheat": {
        "label": "Wheat",
        "model_path": MODELS_DIR / "wheat" / "KrishiNayan_Wheat_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "wheat" / "class_names.json",
    },
    "potato": {
        "label": "Potato",
        "model_path": MODELS_DIR / "potato" / "KrishiNayan_Potato_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "potato" / "class_names.json",
    },
}

# Allow an env var override for the tomato model path specifically,
# same as before this change, for backward compatibility.
CROP_CONFIG["tomato"]["model_path"] = Path(
    os.getenv(
        "KRISHINAYAN_MODEL_PATH",
        str(CROP_CONFIG["tomato"]["model_path"])
    )
).expanduser()

# Kept for any old code that still imports these two names directly.
MODEL_PATH = CROP_CONFIG["tomato"]["model_path"]
CLASS_NAMES_PATH = CROP_CONFIG["tomato"]["class_names_path"]

IMAGE_SIZE = (224, 224)

CONFIDENCE_THRESHOLD = 0.70

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024


def get_crop_config(crop: str | None):
    """
    Return the model/class-names config for a crop, defaulting to
    tomato if none is given. Raises ValueError for an unknown crop.
    """
    crop_key = (crop or DEFAULT_CROP).strip().lower()

    if crop_key not in CROP_CONFIG:
        supported = ", ".join(sorted(CROP_CONFIG))
        raise ValueError(
            f"Unsupported crop '{crop}'. Supported crops: {supported}."
        )

    return crop_key, CROP_CONFIG[crop_key]

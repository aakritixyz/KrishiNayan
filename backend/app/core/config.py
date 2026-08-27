import os

from pathlib import Path
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")
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
        "image_size": (224, 224),
    },
    "maize": {
        "label": "Maize",
        "model_path": MODELS_DIR / "maize" / "KrishiNayan_Maize_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "maize" / "class_names.json",
        "image_size": (224, 224),
    },
    "rice": {
        "label": "Rice",
        "model_path": MODELS_DIR / "rice" / "KrishiNayan_Rice_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "rice" / "class_names.json",
        "image_size": (300, 300),
    },
    "wheat": {
        "label": "Wheat",
        "model_path": MODELS_DIR / "wheat" / "KrishiNayan_Wheat_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "wheat" / "class_names.json",
        "image_size": (224, 224),
    },
    "potato": {
        "label": "Potato",
        "model_path": MODELS_DIR / "potato" / "KrishiNayan_Potato_EfficientNetB0.keras",
        "class_names_path": MODELS_DIR / "potato" / "class_names.json",
        "image_size": (224, 224),
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


# --- Policy Dashboard ---

POLICIES_DATA_PATH = (
    BACKEND_DIR
    / "app"
    / "data"
    / "policies.json"
)

# --- AI Farmer Chatbot / RAG ---

KNOWLEDGE_BASE_DIR = (
    BACKEND_DIR
    / "app"
    / "data"
    / "knowledge_base"
)

# Minimum similarity score (0-1) a retrieved knowledge chunk must
# reach before the chatbot treats it as usable context. Below this
# the chatbot asks a clarifying question instead of guessing.
RAG_CONFIDENCE_THRESHOLD = 0.12

RAG_TOP_K = 3

# Optional: if set, the chatbot uses the Anthropic API to compose a
# farmer-friendly answer grounded in the retrieved knowledge base
# passages. If unset, the chatbot falls back to a template-based
# answer built directly from the retrieved passages (no external
# API call, works fully offline).
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

ANTHROPIC_MODEL = os.getenv(
    "KRISHINAYAN_ANTHROPIC_MODEL",
    "claude-sonnet-4-5"
)

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

SUPPORTED_CHAT_LANGUAGES = ("en", "hi")

# --- Authentication / Database ---

STORAGE_DIR = BACKEND_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv(
    "KRISHINAYAN_DATABASE_URL",
    f"sqlite:///{STORAGE_DIR / 'krishinayan.db'}"
)

# IMPORTANT: this default is for local development only. Always set
# KRISHINAYAN_JWT_SECRET to a long random value before deploying
# anywhere reachable outside your own machine.
_DEFAULT_JWT_SECRET = "dev-only-insecure-secret-change-me-before-any-real-deployment"
JWT_SECRET_KEY = os.getenv("KRISHINAYAN_JWT_SECRET", _DEFAULT_JWT_SECRET)
APP_ENV = os.getenv("KRISHINAYAN_ENV", "development").strip().lower()

if APP_ENV in {"production", "prod"} and JWT_SECRET_KEY == _DEFAULT_JWT_SECRET:
    raise RuntimeError(
        "KRISHINAYAN_JWT_SECRET must be set to a strong secret in production."
    )

JWT_ALGORITHM = "HS256"

# 7 days - persistent login without a refresh-token flow, matching
# the prototype's needs. Revisit before production use.
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

MIN_PASSWORD_LENGTH = 8

SUPPORTED_PROFILE_LANGUAGES = ("en", "hi")

FARMER_CATEGORIES = ("marginal", "small", "general")

IRRIGATION_TYPES = (
    "drip",
    "sprinkler",
    "flood",
    "rain-fed",
    "borewell",
    "canal",
    "other"
)

# Fields that must be filled in for a profile to count as
# "complete" - drives the profile-completion status shown to the
# user and used to gate onboarding.
REQUIRED_PROFILE_FIELDS = (
    "full_name",
    "state",
    "district",
    "village",
    "farm_size_acres",
    "crops",
    "irrigation_type",
    "language"
)

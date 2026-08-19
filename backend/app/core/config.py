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

from fastapi import APIRouter, Depends

from pydantic import BaseModel, Field

from app.core.deps import get_current_user_optional
from app.models.user import User

from app.services.chatbot_service import ask

router = APIRouter()


class DiagnosisContext(BaseModel):
    disease: str | None = None
    confidence: float | None = None
    severity: str | None = None
    prediction_status: str | None = None


class WeatherContext(BaseModel):
    temperature: float | None = None
    humidity: float | None = None
    wind_speed: float | None = None
    rain_expected: bool | None = None


class FarmerContext(BaseModel):
    crop: str | None = None
    stage: str | None = None
    location: str | None = None
    diagnosis: DiagnosisContext | None = None
    weather: WeatherContext | None = None
    soil_summary: str | None = None
    plot_history: list[str] | None = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language: str | None = None
    context: FarmerContext | None = None


def _profile_defaults(user: User | None):
    """
    Build fallback context/language from a logged-in farmer's saved
    profile. Anything the request already specifies always wins -
    this only fills gaps, and returns nothing at all when no one is
    logged in, so anonymous use is unaffected.
    """
    if not user:
        return {}, None

    crops = user.crops_list()
    location_parts = [
        part
        for part in (user.village, user.district, user.state)
        if part
    ]

    context_defaults = {
        "crop": crops[0] if crops else None,
        "location": (
            ", ".join(location_parts) if location_parts else None
        )
    }

    context_defaults = {
        key: value
        for key, value in context_defaults.items()
        if value
    }

    return context_defaults, user.language


@router.post("/chatbot/ask")
def chatbot_ask(
    request: ChatRequest,
    current_user: User | None = Depends(get_current_user_optional)
):
    """
    Ask the AI farmer chatbot a question. Uses retrieval-augmented
    generation over a trusted agronomy knowledge base, grounded in
    the farmer's crop/stage/location/diagnosis/weather/plot history
    when supplied. Asks a clarifying question instead of guessing
    when the knowledge base has nothing confidently relevant.

    Works with or without login. When a valid access token is sent,
    any crop/location left out of the request context is filled in
    from the farmer's saved profile, and the reply language falls
    back to the farmer's saved language preference.
    """
    context = (
        request.context.model_dump(exclude_none=True)
        if request.context
        else {}
    )

    profile_context, profile_language = _profile_defaults(
        current_user
    )

    context = {**profile_context, **context}
    language = request.language or profile_language or "en"

    return ask(
        query=request.message,
        language=language,
        context=context
    )

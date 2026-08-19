from fastapi import APIRouter

from pydantic import BaseModel, Field

from app.services.chatbot_service import ask

router = APIRouter()


class DiagnosisContext(BaseModel):
    disease: str | None = None
    confidence: float | None = None


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
    plot_history: list[str] | None = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language: str = "en"
    context: FarmerContext | None = None


@router.post("/chatbot/ask")
def chatbot_ask(request: ChatRequest):
    """
    Ask the AI farmer chatbot a question. Uses retrieval-augmented
    generation over a trusted agronomy knowledge base, grounded in
    the farmer's crop/stage/location/diagnosis/weather/plot history
    when supplied. Asks a clarifying question instead of guessing
    when the knowledge base has nothing confidently relevant.
    """
    context = (
        request.context.model_dump(exclude_none=True)
        if request.context
        else {}
    )

    return ask(
        query=request.message,
        language=request.language,
        context=context
    )

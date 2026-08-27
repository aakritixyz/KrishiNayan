from fastapi import APIRouter, Query

from app.services.weather_service import get_weather_data

router = APIRouter(tags=["weather"])

SUPPORTED_LANGUAGES = {"en", "hi", "pa", "mr"}


@router.get("/weather")
def current_weather(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    language: str = Query("en"),
):
    """
    Return current Open-Meteo weather plus a location label localized
    to English, Hindi, Punjabi or Marathi.
    """
    selected_language = (
        language.strip().lower()
        if language.strip().lower() in SUPPORTED_LANGUAGES
        else "en"
    )

    return get_weather_data(
        latitude=latitude,
        longitude=longitude,
        language=selected_language,
    )

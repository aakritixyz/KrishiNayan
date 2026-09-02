import logging
import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from app.routes.weather import router as weather_router

load_dotenv()

from app.core.database import init_db
from app.routes.predict import router as predict_router
from app.routes.soil import router as soil_router
from app.routes.crops import router as crops_router
from app.routes.chatbot import router as chatbot_router
from app.routes.policy import router as policy_router
from app.routes.crop_soil_advisory import router as crop_soil_advisory_router
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.crop_health import router as crop_health_router
from app.routes.officer import router as officer_router
from app.routes.advisories import router as advisories_router
from app.routes.plots import router as plots_router
from app.routes.recovery import router as recovery_router
from app.routes.alerts import router as alerts_router
from app.core.config import CROP_CONFIG

from fastapi.middleware.cors import CORSMiddleware
from app.routes.voice import router as voice_router
from app.services.storage_service import storage_status

logging.basicConfig(
    level=os.getenv("KRISHINAYAN_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("krishinayan")


def _get_allowed_origins():
    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    extra_origins = [
        origin.strip().rstrip("/")
        for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
        if origin.strip()
    ]

    app_env = os.getenv("KRISHINAYAN_ENV", "development").strip().lower()
    if app_env in {"production", "prod"} and not extra_origins:
        raise RuntimeError(
            "FRONTEND_ORIGINS must be set in production."
        )

    return sorted(set(defaults + extra_origins))


ALLOWED_ORIGINS = _get_allowed_origins()


app = FastAPI(
    title="KrishiNayan API",
    description="Backend API for crop disease detection and advisory",
    version="1.0.0"
)

app.include_router(weather_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unexpected_error_handler(request: Request, error: Exception):
    logger.exception("Unhandled request error: %s %s", request.method, request.url)
    response = JSONResponse(
        status_code=500,
        content={"detail": "Server error. Please try again."},
    )
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    return response


# Called eagerly (not just as a startup event) so tables exist as
# soon as this module is imported - matters for test clients that
# aren't used as a context manager, which skip lifespan events.
init_db()


app.include_router(predict_router)
app.include_router(soil_router)
app.include_router(crops_router)
app.include_router(chatbot_router)
app.include_router(policy_router)
app.include_router(crop_soil_advisory_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(crop_health_router)
app.include_router(officer_router)
app.include_router(advisories_router)
app.include_router(voice_router)
app.include_router(plots_router)
app.include_router(recovery_router)
app.include_router(alerts_router)

@app.get("/")
def root():
    return {
        "message": "KrishiNayan backend running"
    }


@app.get("/health")
def health_check():
    db_ok = True
    try:
        from sqlalchemy import text
        from app.core.database import SessionLocal

        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    except Exception:
        logger.exception("Health check database probe failed")
        db_ok = False

    models = {
        crop: {
            "label": settings["label"],
            "model_available": settings["model_path"].exists(),
            "classes_available": settings["class_names_path"].exists(),
        }
        for crop, settings in CROP_CONFIG.items()
    }

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "ok" if db_ok else "unavailable",
        "storage": storage_status(),
        "models": models,
    }

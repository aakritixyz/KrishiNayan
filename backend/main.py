from fastapi import FastAPI

from app.core.database import init_db
from app.routes.predict import router as predict_router
from app.routes.soil import router as soil_router
from app.routes.crops import router as crops_router
from app.routes.chatbot import router as chatbot_router
from app.routes.policy import router as policy_router
from app.routes.crop_soil_advisory import router as crop_soil_advisory_router
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="KrishiNayan API",
    description="Backend API for crop disease detection and advisory",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
def root():
    return {
        "message": "KrishiNayan backend running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
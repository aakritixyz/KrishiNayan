from fastapi import FastAPI

from app.routes.predict import router as predict_router

app = FastAPI(
    title="KrishiNayan API",
    description="Backend API for crop disease detection and advisory",
    version="1.0.0"
)

app.include_router(predict_router)


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
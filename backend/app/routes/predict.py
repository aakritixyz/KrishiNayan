from fastapi import APIRouter, File, UploadFile

router = APIRouter()


@router.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "message": "Image received successfully",
        "prediction": "ML integration pending"
    }
from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile
)

from app.core.config import (
    MAX_IMAGE_SIZE_BYTES
)

from app.services.ml_service import (
    predict_disease
)


router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/bmp"
}


@router.post("/predict")
async def predict_image(
    file: UploadFile = File(...)
):
    """
    Receive a tomato-leaf image and return
    the predicted disease and confidence.
    """

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=(
                "Unsupported file type. "
                "Upload a JPG, PNG or BMP image."
            )
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 10 MB."
        )

    try:
        prediction = predict_disease(
            image_bytes
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error)
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    return {
        "crop": "Tomato",
        "filename": file.filename,
        "detected_issue": prediction["disease"],
        "confidence": prediction["confidence"],
        "prediction_status": prediction["status"]
}

from app.services.advisory_service import get_farmer_message
from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile
)

from app.services.advisory_service import (
    get_farmer_message
)

from app.services.weather_service import (
    get_weather_data
)

from app.core.config import (
    MAX_IMAGE_SIZE_BYTES
)

from app.services.ml_service import (
    predict_disease
)

from app.services.storage_service import save_uploaded_image

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/bmp"
}


@router.post("/predict")
async def predict_image(
    file: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None)
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

    saved_image_path = save_uploaded_image(
    file.filename,
    image_bytes
    )



    try:
        prediction = predict_disease(
            image_bytes
        )
        
        weather = get_weather_data(
            latitude=latitude,
            longitude=longitude
        )

        advisory = get_farmer_message(
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            rain_expected=weather["rain_expected"],
            wind_speed=weather["wind_speed"],
            humidity=weather["humidity"]
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
    "saved_image_path": saved_image_path,
    "confidence": prediction["confidence"],
    "prediction_status": prediction["status"],
    "weather": weather,
    "severity": advisory["severity"],
    "weather_risk": advisory["weather_risk"],
    "recommended_action": advisory["recommended_action"],
    "farmer_message": advisory["farmer_message"]
}

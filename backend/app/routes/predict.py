from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)

from sqlalchemy.orm import Session

from app.services.advisory_service import (
    get_farmer_message
)

from app.services.weather_service import (
    get_weather_data
)

from app.core.config import (
    CROP_CONFIG,
    MAX_IMAGE_SIZE_BYTES
)

from app.core.database import get_db
from app.core.deps import get_current_user_optional
from app.models.user import User

from app.services import health_service

from app.services.ml_service import (
    generate_gradcam_overlay,
    predict_disease
)

from app.services.storage_service import save_uploaded_image

from app.services.soil_service import (
    get_soil_context,
    get_soil_profile
)

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
    longitude: float | None = Form(None),
    state: str | None = Form(None),
    district: str | None = Form(None),
    crop: str | None = Form("tomato"),
    field_label: str | None = Form(None),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Receive a crop-leaf image and return the ML-predicted
    disease and confidence.

    Anonymous scans are allowed. If the request includes a valid
    farmer token and state/district weren't supplied, it falls back
    to the logged-in farmer's saved profile location instead of
    skipping soil context.

    Farmer scans are also recorded into Crop Health Memory (grouped
    by crop and, optionally, field_label), and the response includes
    a real before-vs-current health comparison against their previous
    scan of the same crop/field, if one exists.
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

    is_active_farmer = (
        current_user is not None
        and current_user.role == "farmer"
        and current_user.is_active
    )

    if is_active_farmer:
        state = state or current_user.state
        district = district or current_user.district

    try:
        prediction = predict_disease(
            image_bytes,
            crop=crop
        )
        
        weather = get_weather_data(
            latitude=latitude,
            longitude=longitude
        )

        rain_expected = bool(weather.get("rain_expected"))
        wind_speed = weather.get("wind_speed") or 0
        humidity = weather.get("humidity") or 0

        advisory = get_farmer_message(
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            rain_expected=rain_expected,
            wind_speed=wind_speed,
            humidity=humidity
        )

        soil_context = None

        if state and district:
            soil_profile = get_soil_profile(state, district)

            soil_context = get_soil_context(
                disease=prediction["disease"],
                confidence=prediction["confidence"],
                soil_profile=soil_profile,
                rain_expected=rain_expected,
                humidity=humidity
            )

        gradcam_result = generate_gradcam_overlay(
            image_bytes,
            crop=crop
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=(
                f"{error} This crop is not available yet — "
                "please try Tomato for now."
            )
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    crop_display_label = CROP_CONFIG.get(
        prediction["crop"], {}
    ).get("label", prediction["crop"].title())

    health_summary = None

    if is_active_farmer:
        resolved_field_label = (
            field_label.strip() if field_label else crop_display_label
        )

        previous_scan = health_service.get_previous_scan(
            db,
            current_user.id,
            prediction["crop"],
            resolved_field_label
        )

        health_score = health_service.compute_health_score(
            prediction["disease"],
            prediction["confidence"]
        )

        comparison = health_service.compute_comparison(
            health_score,
            previous_scan.health_score if previous_scan else None
        )

        health_service.record_scan(
            db,
            user_id=current_user.id,
            crop=prediction["crop"],
            crop_label=crop_display_label,
            field_label=resolved_field_label,
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            prediction_status=prediction["status"],
            severity=advisory["severity"],
            image_path=saved_image_path
        )

        health_summary = {
            "field_label": resolved_field_label,
            "health_score": health_score,
            "previous_health_score": (
                previous_scan.health_score if previous_scan else None
            ),
            "point_change": comparison["point_change"],
            "percent_change": comparison["percent_change"],
            "trend": comparison["trend"]
        }

    return {
    "crop": crop_display_label,
    "filename": file.filename,
    "detected_issue": prediction["disease"],
    "saved_image_path": saved_image_path,
    "confidence": prediction["confidence"],
    "prediction_status": prediction["status"],
    "weather": weather,
    "severity": advisory["severity"],
    "weather_risk": advisory["weather_risk"],
    "recommended_action": advisory["recommended_action"],
    "farmer_message": advisory["farmer_message"],
    "soil_context": soil_context,
    "health": health_summary,
    "gradcam_image": (
        gradcam_result["heatmap_image"] if gradcam_result else None
    )
}

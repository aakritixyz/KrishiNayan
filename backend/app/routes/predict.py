from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)
import logging

from sqlalchemy.orm import Session

from app.services.advisory_service import (
    get_farmer_message,
    get_treatment_cost_estimate,
)

from app.services.weather_service import (
    get_known_coordinates,
    get_weather_data
)

from app.core.config import (
    CROP_CONFIG,
    ENABLE_GRADCAM,
    MAX_IMAGE_SIZE_BYTES
)

from app.core.database import get_db
from app.core.deps import get_current_user_optional
from app.models.user import User

from app.services import health_service
from app.services import plot_service
from app.services import recovery_service

from app.services.ml_service import (
    generate_gradcam_overlay,
    predict_disease
)

from app.services.storage_service import save_uploaded_image
from app.services.startuped_service import send_startuped_signal

from app.services.soil_service import (
    get_soil_context,
    get_soil_profile
)
from app.services.rate_limit_service import rate_limit

router = APIRouter()
logger = logging.getLogger(__name__)

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
    plot_id: int | None = Form(None),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
    _rate_limit: None = Depends(rate_limit(limit=12, window_seconds=60)),
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

    is_active_farmer = (
        current_user is not None
        and current_user.role == "farmer"
        and current_user.is_active
    )

    if is_active_farmer:
        state = state or current_user.state
        district = district or current_user.district

    plot = None
    if is_active_farmer and plot_id is not None:
        plot = plot_service.get_plot(db, current_user.id, plot_id)
        if not plot:
            raise HTTPException(status_code=404, detail="Plot not found.")
        crop = plot.crop
        field_label = field_label or plot.name
        state = state or plot.state
        district = district or plot.district
        latitude = latitude if latitude is not None else plot.latitude
        longitude = longitude if longitude is not None else plot.longitude

    try:
        prediction = predict_disease(
            image_bytes,
            crop=crop
        )

        if latitude is None or longitude is None:
            known_coordinates = get_known_coordinates(state, district)
            if known_coordinates:
                latitude, longitude = known_coordinates
        
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

        area_acres = plot.area_acres if plot and plot.area_acres else 1
        cost_estimate = get_treatment_cost_estimate(
            prediction["disease"],
            area_acres=area_acres,
        )
        advisory["cost_estimate"] = cost_estimate

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

        gradcam_result = None
        if ENABLE_GRADCAM:
            gradcam_result = generate_gradcam_overlay(
                image_bytes,
                crop=crop
            )

    except FileNotFoundError as error:
        logger.warning("Prediction unavailable: %s", error)
        raise HTTPException(
            status_code=503,
            detail=(
                f"{error} This crop is not available yet — "
                "please try Tomato for now."
            )
        ) from error

    except ValueError as error:
        logger.warning("Prediction rejected: %s", error)
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    except Exception as error:
        logger.exception("Prediction request failed")
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Please try again with a clearer image."
        ) from error

    saved_image_path = None
    try:
        saved_image_path = save_uploaded_image(
            file.filename,
            image_bytes
        )
    except Exception:
        logger.exception("Image storage failed; continuing without saved image")

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

        scan_record = health_service.record_scan(
            db,
            user_id=current_user.id,
            crop=prediction["crop"],
            crop_label=crop_display_label,
            field_label=resolved_field_label,
            disease=prediction["disease"],
            confidence=prediction["confidence"],
            prediction_status=prediction["status"],
            severity=advisory["severity"],
            image_path=saved_image_path,
            plot_id=plot.id if plot else None,
            state=state,
            district=district,
            latitude=latitude,
            longitude=longitude,
            treatment_cost_min=cost_estimate["min"],
            treatment_cost_max=cost_estimate["max"],
        )

        recovery_plan, recovery_tasks = recovery_service.create_plan_for_scan(
            db,
            scan_record,
            advisory["recommended_action"],
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
    else:
        recovery_plan = None
        recovery_tasks = []

    await send_startuped_signal(
        name="Crop Scan Completed",
        description=f"User completed a {prediction['crop']} crop scan.",
        signal_type="behavioral",
        strength=80,
        value="High",
    )

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
        "cost_estimate": advisory["cost_estimate"],
        "farmer_message": advisory["farmer_message"],
        "soil_context": soil_context,
        "health": health_summary,
        "recovery": (
            recovery_service.serialize_plan(recovery_plan, recovery_tasks)
            if recovery_plan
            else None
        ),
        "gradcam_image": (
            gradcam_result["heatmap_image"] if gradcam_result else None
        )
    }

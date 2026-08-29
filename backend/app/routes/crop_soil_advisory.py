from fastapi import APIRouter, HTTPException

from app.services.crop_soil_advisory_service import (
    get_advisory_districts,
    get_crop_soil_advisory,
    get_supported_advisory_crops
)

router = APIRouter(prefix="/crop-soil-advisory", tags=["crop-soil-advisory"])


@router.get("/crops")
def list_advisory_crops():
    """
    Which crops have real Soil Health Card-based advisory data
    available (currently: Maize/Bihar and Rice/Telangana)
    — separate from the generic representative soil profiles used
    by /soil.
    """
    return {"crops": get_supported_advisory_crops()}


@router.get("/districts")
def list_advisory_districts(crop: str):
    """
    Districts covered by the real advisory dataset for a crop.
    """
    districts = get_advisory_districts(crop)

    if not districts:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No Soil Health Card advisory data available for "
                f"crop '{crop}' yet."
            )
        )

    return {"crop": crop, "districts": districts}


@router.get("")
def crop_soil_advisory(crop: str, district: str):
    """
    Real Soil Health Card-based soil risk summary and
    recommendations for a given crop + district.
    """
    advisory = get_crop_soil_advisory(crop, district)

    if advisory is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No Soil Health Card advisory data available for "
                f"{district} ({crop})."
            )
        )

    return advisory

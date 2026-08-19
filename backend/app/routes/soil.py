from fastapi import APIRouter, HTTPException

from app.services.soil_service import (
    get_districts_for_state,
    get_soil_profile,
    get_supported_states
)

router = APIRouter(prefix="/soil", tags=["soil"])


@router.get("/states")
def list_states():
    """
    Return the list of states currently covered by the soil dataset.
    """
    return {"states": get_supported_states()}


@router.get("/districts")
def list_districts(state: str):
    """
    Return the list of districts covered for a given state.
    """
    districts = get_districts_for_state(state)

    if not districts:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No soil data available for state '{state}'. "
                "Choose one of the supported states."
            )
        )

    return {"state": state, "districts": districts}


@router.get("/profile")
def soil_profile(state: str, district: str):
    """
    Return the raw soil profile for a given state + district.
    """
    profile = get_soil_profile(state, district)

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No soil data available for {district}, {state}."
            )
        )

    return profile

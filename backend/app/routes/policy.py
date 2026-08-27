from fastapi import APIRouter, Depends, Query

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_farmer
from app.models.user import User

from app.services.policy_service import (
    get_eligible_schemes,
    load_policies,
)

router = APIRouter()

SUPPORTED_LANGUAGES = {"en", "hi", "pa", "mr"}


class FarmerProfile(BaseModel):
    state: str | None = None
    land_holding_acres: float | None = None
    crop: str = "Tomato"
    category: str | None = None
    has_bank_account: bool | None = None
    has_aadhaar: bool | None = None
    excluded_categories: list[str] | None = None
    language: str = "en"


def _normalize_language(language: str | None) -> str:
    value = (language or "en").strip().lower()
    return value if value in SUPPORTED_LANGUAGES else "en"


@router.get("/policies")
def list_policies(
    language: str = Query("en"),
):
    """
    Return every government scheme in the selected display language.

    This endpoint is unranked. Eligibility rules and source metadata
    remain unchanged, while display-facing policy fields are localized.
    """
    selected_language = _normalize_language(language)

    schemes = load_policies()

    # Reuse the policy service's localization flow without changing
    # ranking semantics by passing a neutral profile through the normal
    # eligibility function and extracting the localized scheme objects.
    localized_results = get_eligible_schemes(
        {
            "crop": "",
            "language": selected_language,
        },
        language=selected_language,
    )

    return {
        "language": selected_language,
        "schemes": [result["scheme"] for result in localized_results],
    }


@router.post("/policies/eligible")
def eligible_policies(profile: FarmerProfile):
    """
    Rank government schemes for a specific farmer profile.

    The frontend sends the currently selected UI language as:
    en / hi / pa / mr

    The backend then returns every display-facing scheme field and
    every dynamic match reason in that language.
    """
    profile_data = profile.model_dump(exclude_none=True)

    selected_language = _normalize_language(
        profile_data.get("language")
    )

    profile_data["language"] = selected_language

    results = get_eligible_schemes(
        profile_data,
        language=selected_language,
    )

    return {
        "language": selected_language,
        "results": results,
    }


@router.get("/policies/eligible/me")
def eligible_policies_for_me(
    language: str = Query("en"),
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    """
    Rank schemes from the logged-in farmer's saved profile.

    The UI language is supplied as a query parameter, for example:
        /policies/eligible/me?language=hi
        /policies/eligible/me?language=pa
        /policies/eligible/me?language=mr

    This prevents the saved profile language from overriding the
    language currently selected in the app.
    """
    selected_language = _normalize_language(language)

    crops = current_user.crops_list()

    identity_verified = (
        current_user.identity_verification_status == "verified"
    )

    profile = {
        "state": current_user.state,
        "land_holding_acres": current_user.farm_size_acres,
        "crop": crops[0] if crops else "Tomato",
        "category": current_user.farmer_category,
        "has_aadhaar": True if identity_verified else None,
        "language": selected_language,
    }

    profile = {
        key: value
        for key, value in profile.items()
        if value is not None
    }

    results = get_eligible_schemes(
        profile,
        language=selected_language,
    )

    return {
        "language": selected_language,
        "results": results,
        "profile_used": profile,
    }

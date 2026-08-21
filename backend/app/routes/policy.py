from fastapi import APIRouter, Depends

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.services.policy_service import (
    get_eligible_schemes,
    load_policies
)

router = APIRouter()


class FarmerProfile(BaseModel):
    state: str | None = None
    land_holding_acres: float | None = None
    crop: str = "Tomato"
    category: str | None = None
    has_bank_account: bool | None = None
    has_aadhaar: bool | None = None
    excluded_categories: list[str] | None = None


@router.get("/policies")
def list_policies():
    """
    Return every government scheme in the curated dataset,
    unranked, with its source and last-verified date.
    """
    return {"schemes": load_policies()}


@router.post("/policies/eligible")
def eligible_policies(profile: FarmerProfile):
    """
    Rank government schemes for a specific farmer profile:
    eligible schemes first (most relevant first), each with the
    reasons behind the match. This is a pre-screen, not a legal
    determination - farmers should confirm on the official portal.
    """
    results = get_eligible_schemes(
        profile.model_dump(exclude_none=True)
    )

    return {"results": results}


@router.get("/policies/eligible/me")
def eligible_policies_for_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Same ranking as /policies/eligible, but built automatically
    from the logged-in farmer's saved profile - no form to fill in.
    Requires login.
    """
    crops = current_user.crops_list()

    identity_verified = (
        current_user.identity_verification_status == "verified"
    )

    profile = {
        "state": current_user.state,
        "land_holding_acres": current_user.farm_size_acres,
        "crop": crops[0] if crops else "Tomato",
        "category": current_user.farmer_category,
        # We only positively know Aadhaar possession once the
        # (mock) identity check has passed - otherwise we simply
        # don't know, so we leave it unset rather than assume "no".
        "has_aadhaar": True if identity_verified else None
    }

    profile = {
        key: value
        for key, value in profile.items()
        if value is not None
    }

    results = get_eligible_schemes(profile)

    return {
        "results": results,
        "profile_used": profile
    }

from fastapi import APIRouter

from pydantic import BaseModel

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

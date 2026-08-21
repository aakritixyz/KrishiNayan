from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.profile import (
    IdentityVerificationOut,
    ProfileOut,
    ProfileUpdate
)

from app.services.identity_service import get_identity_provider
from app.services.user_service import to_profile_out, update_profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return to_profile_out(current_user)


@router.put("", response_model=ProfileOut)
def edit_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = update_profile(db, current_user, payload)
    return to_profile_out(user)


@router.post(
    "/verify-identity",
    response_model=IdentityVerificationOut
)
def verify_identity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Prototype-only mock identity verification step. Does not
    collect, request, or store any Aadhaar number or other
    government ID - see app/services/identity_service.py for how
    to swap in a real, authorized e-KYC provider later.
    """
    provider = get_identity_provider()
    result = provider.verify(current_user.id)

    current_user.identity_verification_status = result["status"]
    current_user.identity_verification_provider = result["provider"]
    current_user.identity_verification_reference = (
        result["reference"]
    )
    current_user.identity_verified_at = result["verified_at"]

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return IdentityVerificationOut(
        identity_verification_status=(
            current_user.identity_verification_status
        ),
        identity_verification_provider=(
            current_user.identity_verification_provider
        ),
        identity_verification_reference=(
            current_user.identity_verification_reference
        ),
        identity_verified_at=(
            current_user.identity_verified_at.isoformat()
        ),
        message=(
            "Prototype identity check complete (mock provider - "
            "no Aadhaar or government ID number was collected or "
            "stored)."
        )
    )

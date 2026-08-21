from app.core.config import REQUIRED_PROFILE_FIELDS
from app.models.user import User


def compute_completion(user: User):
    """
    Return (is_complete, completion_percent, missing_fields) for a
    user's profile, based on REQUIRED_PROFILE_FIELDS.
    """
    missing = []

    for field in REQUIRED_PROFILE_FIELDS:
        if field == "crops":
            if not user.crops_list():
                missing.append(field)
            continue

        value = getattr(user, field, None)

        if value in (None, ""):
            missing.append(field)

    total_fields = len(REQUIRED_PROFILE_FIELDS)
    filled_fields = total_fields - len(missing)

    percent = (
        round((filled_fields / total_fields) * 100)
        if total_fields
        else 100
    )

    return not missing, percent, missing


def update_profile(db, user: User, data) -> User:
    """
    Apply only the fields present in the request (partial update),
    then recompute profile_completed.
    """
    update_fields = data.model_dump(exclude_unset=True)

    if "crops" in update_fields:
        crops = update_fields.pop("crops")
        user.crops = ",".join(crops) if crops else None

    for field, value in update_fields.items():
        setattr(user, field, value)

    is_complete, _, _ = compute_completion(user)
    user.profile_completed = is_complete

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def to_profile_out(user: User):
    from app.schemas.profile import ProfileOut

    is_complete, percent, missing = compute_completion(user)

    return ProfileOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        language=user.language,
        state=user.state,
        district=user.district,
        village=user.village,
        farm_size_acres=user.farm_size_acres,
        crops=user.crops_list(),
        irrigation_type=user.irrigation_type,
        farmer_category=user.farmer_category,
        profile_completed=is_complete,
        completion_percent=percent,
        missing_fields=missing,
        identity_verification_status=(
            user.identity_verification_status
        ),
        identity_verification_provider=(
            user.identity_verification_provider
        ),
        identity_verified_at=(
            user.identity_verified_at.isoformat()
            if user.identity_verified_at
            else None
        )
    )

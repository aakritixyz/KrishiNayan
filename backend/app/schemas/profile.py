from pydantic import BaseModel, field_validator

from app.core.config import (
    FARMER_CATEGORIES,
    IRRIGATION_TYPES,
    SUPPORTED_PROFILE_LANGUAGES
)


class ProfileUpdate(BaseModel):
    """
    All fields optional - the farmer can fill these in over one or
    more visits (onboarding wizard, then later edits) and each
    request only sends what changed.
    """
    full_name: str | None = None
    language: str | None = None
    state: str | None = None
    district: str | None = None
    village: str | None = None
    farm_size_acres: float | None = None
    crops: list[str] | None = None
    irrigation_type: str | None = None
    farmer_category: str | None = None

    @field_validator("language")
    @classmethod
    def language_supported(cls, value):
        if value is not None and value not in SUPPORTED_PROFILE_LANGUAGES:
            raise ValueError(
                "Unsupported language. Choose one of: "
                + ", ".join(SUPPORTED_PROFILE_LANGUAGES)
            )
        return value

    @field_validator("irrigation_type")
    @classmethod
    def irrigation_type_supported(cls, value):
        if value is not None and value not in IRRIGATION_TYPES:
            raise ValueError(
                "Unsupported irrigation type. Choose one of: "
                + ", ".join(IRRIGATION_TYPES)
            )
        return value

    @field_validator("farmer_category")
    @classmethod
    def farmer_category_supported(cls, value):
        if value is not None and value not in FARMER_CATEGORIES:
            raise ValueError(
                "Unsupported farmer category. Choose one of: "
                + ", ".join(FARMER_CATEGORIES)
            )
        return value

    @field_validator("farm_size_acres")
    @classmethod
    def farm_size_not_negative(cls, value):
        if value is not None and value < 0:
            raise ValueError("Farm size can't be negative.")
        return value


class ProfileOut(BaseModel):
    id: int
    full_name: str
    email: str | None
    phone: str | None
    language: str
    state: str | None
    district: str | None
    village: str | None
    farm_size_acres: float | None
    crops: list[str]
    irrigation_type: str | None
    farmer_category: str | None
    profile_completed: bool
    completion_percent: int
    missing_fields: list[str]
    identity_verification_status: str
    identity_verification_provider: str | None
    identity_verified_at: str | None


class IdentityVerificationOut(BaseModel):
    identity_verification_status: str
    identity_verification_provider: str | None
    identity_verification_reference: str | None
    identity_verified_at: str | None
    message: str

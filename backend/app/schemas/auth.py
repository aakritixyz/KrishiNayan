import re

from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.core.config import MIN_PASSWORD_LENGTH


_PHONE_PATTERN = re.compile(r"^[6-9]\d{9}$")


class UserRegister(BaseModel):
    full_name: str
    email: EmailStr | None = None
    phone: str | None = None
    password: str
    language: str = "en"

    @field_validator("full_name")
    @classmethod
    def full_name_not_blank(cls, value):
        if not value or not value.strip():
            raise ValueError("Full name is required.")
        return value.strip()

    @field_validator("phone")
    @classmethod
    def phone_looks_valid(cls, value):
        if value is None:
            return value

        digits_only = re.sub(r"\D", "", value)

        if not _PHONE_PATTERN.match(digits_only):
            raise ValueError(
                "Enter a valid 10-digit Indian mobile number."
            )

        return digits_only

    @field_validator("password")
    @classmethod
    def password_strong_enough(cls, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must be at least {MIN_PASSWORD_LENGTH} "
                "characters long."
            )

        if value.isdigit() or value.isalpha():
            raise ValueError(
                "Password must include both letters and numbers."
            )

        return value

    @model_validator(mode="after")
    def email_or_phone_required(self):
        if not self.email and not self.phone:
            raise ValueError(
                "Provide at least an email or a phone number."
            )
        return self


class UserLogin(BaseModel):
    identifier: str  # email or phone
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str | None
    phone: str | None
    language: str
    profile_completed: bool
    identity_verification_status: str

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()

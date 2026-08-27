from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    """
    A KrishiNayan account. Farmer accounts are self-registered; officer
    accounts are provisioned by an administrator after institutional verification.
    Only the mock identity-verification status
    is stored here (see app/services/identity_service.py) - no
    Aadhaar number or other government ID is ever collected or
    persisted by this prototype.
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    # --- Login credentials ---
    email: Mapped[str | None] = mapped_column(
        String, unique=True, index=True, nullable=True
    )
    phone: Mapped[str | None] = mapped_column(
        String, unique=True, index=True, nullable=True
    )
    password_hash: Mapped[str] = mapped_column(
        String, nullable=False
    )

    # --- Account role / institutional scope ---
    role: Mapped[str] = mapped_column(String, default="farmer", index=True)
    institutional_id: Mapped[str | None] = mapped_column(
        String, unique=True, index=True, nullable=True
    )
    organisation: Mapped[str | None] = mapped_column(String, nullable=True)
    designation: Mapped[str | None] = mapped_column(String, nullable=True)
    access_state: Mapped[str | None] = mapped_column(String, nullable=True)
    access_district: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # --- Profile ---
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    language: Mapped[str] = mapped_column(String, default="en")
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    district: Mapped[str | None] = mapped_column(
        String, nullable=True
    )
    village: Mapped[str | None] = mapped_column(
        String, nullable=True
    )
    farm_size_acres: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    # Stored as a comma-separated list (e.g. "Tomato,Onion") to
    # avoid pulling in a JSON column type for SQLite.
    crops: Mapped[str | None] = mapped_column(
        String, nullable=True
    )
    irrigation_type: Mapped[str | None] = mapped_column(
        String, nullable=True
    )
    farmer_category: Mapped[str | None] = mapped_column(
        String, nullable=True
    )

    profile_completed: Mapped[bool] = mapped_column(
        Boolean, default=False
    )

    # --- Mock identity verification (prototype only) ---
    # No Aadhaar or other government ID number is ever stored here.
    identity_verification_status: Mapped[str] = mapped_column(
        String, default="not_started"
    )
    identity_verification_provider: Mapped[str | None] = (
        mapped_column(String, nullable=True)
    )
    identity_verification_reference: Mapped[str | None] = (
        mapped_column(String, nullable=True)
    )
    identity_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow, onupdate=_utcnow
    )

    def crops_list(self):
        if not self.crops:
            return []

        return [
            crop.strip()
            for crop in self.crops.split(",")
            if crop.strip()
        ]

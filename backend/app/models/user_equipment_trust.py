from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class UserEquipmentTrust(Base):
    """
    Trust score and metrics for equipment rental users.
    Calculated from rental history, reviews, and verification status.
    """
    
    __tablename__ = "user_equipment_trust"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, index=True)
    
    # Trust Metrics
    overall_trust_score: Mapped[float] = mapped_column(Float, default=50)
    as_owner_rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    as_renter_rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Activity Metrics
    total_listings: Mapped[int] = mapped_column(Integer, default=0)
    total_rentals_as_owner: Mapped[int] = mapped_column(Integer, default=0)
    total_rentals_as_renter: Mapped[int] = mapped_column(Integer, default=0)
    successful_completions: Mapped[int] = mapped_column(Integer, default=0)
    cancellations: Mapped[int] = mapped_column(Integer, default=0)
    disputes: Mapped[int] = mapped_column(Integer, default=0)
    
    # Verification
    identity_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    equipment_verified_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Response Time
    average_response_time_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
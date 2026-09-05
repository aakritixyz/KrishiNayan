from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Date, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class EquipmentRentalRequest(Base):
    """
    Rental request for equipment listing.
    Represents the workflow from request to completion.
    """
    
    __tablename__ = "equipment_rental_requests"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    listing_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    renter_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    # Rental Details
    requested_start_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    requested_end_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    requested_duration_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_cost: Mapped[float] = mapped_column(Float, nullable=False)
    security_deposit_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Status Workflow
    status: Mapped[str] = mapped_column(String, default="pending", index=True)
    rejection_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Communication
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Pickup/Return
    pickup_location: Mapped[str | None] = mapped_column(String, nullable=True)
    pickup_time: Mapped[str | None] = mapped_column(String, nullable=True)
    return_condition: Mapped[str | None] = mapped_column(String, nullable=True)
    return_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Agreement
    agreed_terms: Mapped[bool] = mapped_column(Boolean, default=False)
    agreement_signed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Completion
    actual_start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    actual_end_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    actual_return_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
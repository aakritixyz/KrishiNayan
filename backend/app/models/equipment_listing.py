from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class EquipmentListing(Base):
    """
    Equipment listing for rental marketplace.
    Farmers can list their farming equipment for others to rent.
    """
    
    __tablename__ = "equipment_listings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    # Equipment Details
    equipment_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    equipment_name: Mapped[str] = mapped_column(String, nullable=False)
    brand: Mapped[str | None] = mapped_column(String, nullable=True)
    model: Mapped[str | None] = mapped_column(String, nullable=True)
    year_manufactured: Mapped[int | None] = mapped_column(Integer, nullable=True)
    condition: Mapped[str] = mapped_column(String, nullable=False)
    
    # Pricing
    rental_price_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    rental_price_per_hour: Mapped[float | None] = mapped_column(Float, nullable=True)
    security_deposit: Mapped[float] = mapped_column(Float, default=0)
    
    # Location
    state: Mapped[str] = mapped_column(String, nullable=False, index=True)
    district: Mapped[str] = mapped_column(String, nullable=False, index=True)
    village: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location_description: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Availability
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    available_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    available_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    booked_dates: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON string
    
    # Media
    photos: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON string
    primary_photo: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Description
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    specifications: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON string
    usage_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    safety_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Status
    status: Mapped[str] = mapped_column(String, default="active", index=True)
    verification_status: Mapped[str] = mapped_column(String, default="pending", index=True)
    listing_quality_score: Mapped[float] = mapped_column(Float, default=0)
    
    # Metadata
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    inquiry_count: Mapped[int] = mapped_column(Integer, default=0)
    rental_count: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
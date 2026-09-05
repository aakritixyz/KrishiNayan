from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class EquipmentReview(Base):
    """
    Review for equipment rental.
    Reviews can be for equipment, owner, or renter.
    Only verified rental participants can leave reviews.
    """
    
    __tablename__ = "equipment_reviews"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    rental_request_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    listing_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    # Reviewer info
    reviewer_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    reviewee_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    review_type: Mapped[str] = mapped_column(String, nullable=False)  # 'equipment', 'owner', 'renter'
    
    # Ratings (1-5 scale)
    overall_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    equipment_condition_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    communication_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    punctuality_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    value_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Review Content
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Trust signals
    verified_rental: Mapped[bool] = mapped_column(Integer, default=True)
    helpful_count: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
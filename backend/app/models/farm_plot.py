from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class FarmPlot(Base):
    """
    A farmer-managed plot/field. Scans can link to a plot so crop
    health, recovery tasks, and nearby alert context are attached to
    real farm records instead of a free-text field label only.
    """

    __tablename__ = "farm_plots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    crop: Mapped[str] = mapped_column(String, nullable=False, index=True)
    crop_label: Mapped[str] = mapped_column(String, nullable=False)
    growth_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    sowing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    area_acres: Mapped[float | None] = mapped_column(Float, nullable=True)

    state: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    district: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    village: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow, onupdate=_utcnow
    )

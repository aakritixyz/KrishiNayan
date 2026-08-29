from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class ScanRecord(Base):
    """
    One completed crop scan, tied to the farmer who ran it. This is
    the backbone of Crop Health Memory: every field on this table
    is copied directly from what /predict actually computed for
    that scan (the model's disease/confidence output and the
    advisory service's severity) - nothing here is fabricated after
    the fact.

    Records are grouped into a history by (user_id, crop,
    field_label). field_label defaults to the crop's display label
    when the farmer doesn't name a specific field, so a farmer who
    never distinguishes fields still gets one continuous history per
    crop, and a farmer who does name fields (e.g. "North Plot") gets
    separate histories.
    """

    __tablename__ = "scan_records"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    crop: Mapped[str] = mapped_column(
        String, nullable=False, index=True
    )
    crop_label: Mapped[str] = mapped_column(String, nullable=False)
    field_label: Mapped[str] = mapped_column(
        String, nullable=False, index=True
    )
    plot_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("farm_plots.id"),
        nullable=True,
        index=True
    )

    disease: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    prediction_status: Mapped[str] = mapped_column(
        String, nullable=False
    )
    severity: Mapped[str] = mapped_column(String, nullable=False)

    # 0-100, derived only from disease + confidence above - see
    # app/services/health_service.py::compute_health_score.
    health_score: Mapped[float] = mapped_column(
        Float, nullable=False
    )

    image_path: Mapped[str | None] = mapped_column(
        String, nullable=True
    )
    state: Mapped[str | None] = mapped_column(
        String, nullable=True, index=True
    )
    district: Mapped[str | None] = mapped_column(
        String, nullable=True, index=True
    )
    latitude: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    longitude: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    treatment_cost_min: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    treatment_cost_max: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow, index=True
    )

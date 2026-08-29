from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class RecoveryPlan(Base):
    """
    Persistent treatment/recovery plan generated after a diseased scan.
    Tasks are explicit records so progress survives page refreshes and
    can be used for reminder views.
    """

    __tablename__ = "recovery_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    plot_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("farm_plots.id"), nullable=True, index=True
    )
    scan_record_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("scan_records.id"), nullable=False, index=True
    )

    crop: Mapped[str] = mapped_column(String, nullable=False, index=True)
    crop_label: Mapped[str] = mapped_column(String, nullable=False)
    disease: Mapped[str] = mapped_column(String, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String, default="active", index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class RecoveryTask(Base):
    __tablename__ = "recovery_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("recovery_plans.id"), nullable=False, index=True
    )

    day: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    best_time: Mapped[str | None] = mapped_column(String, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class OfficerRegistrationRequest(Base):
    __tablename__ = "officer_registration_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    official_email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    institutional_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    organisation: Mapped[str] = mapped_column(String, nullable=False)
    designation: Mapped[str] = mapped_column(String, nullable=False)
    state: Mapped[str] = mapped_column(String, nullable=False)
    district: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )

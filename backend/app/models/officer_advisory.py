from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class OfficerAdvisory(Base):
    __tablename__ = "officer_advisories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    officer_user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    state: Mapped[str] = mapped_column(String, nullable=False, index=True)
    district: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    crop: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    language: Mapped[str] = mapped_column(String, default="en")
    title: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)

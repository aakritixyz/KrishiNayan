"""
Seed recent diseased scan records so Nearby Crop Alerts has live demo data.

The records are inserted through the same SQLAlchemy models used by the app,
so the frontend still reads real backend data rather than hardcoded samples.
"""

from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal, init_db
from app.models.scan_record import ScanRecord
from app.models.user import User
from app.services.health_service import compute_health_score


DEMO_EMAIL = "demo.alerts.farmer@krishinayan.local"


def _demo_user(db):
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if user:
        return user

    user = User(
        full_name="Demo Alert Farmer",
        email=DEMO_EMAIL,
        password_hash="demo-seed-not-for-login",
        role="farmer",
        is_active=True,
        language="en",
        state="Maharashtra",
        district="Pune",
        village="Hadapsar",
        farm_size_acres=2.5,
        crops="Tomato, Maize, Rice",
        irrigation_type="drip",
        profile_completed=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def main():
    init_db()
    db = SessionLocal()
    try:
        user = _demo_user(db)
        existing = db.query(ScanRecord).filter(
            ScanRecord.user_id == user.id,
            ScanRecord.field_label.like("Demo Alert%")
        ).count()
        if existing:
            print(f"Demo alert scans already present: {existing}")
            return

        now = datetime.now(timezone.utc)
        seeds = [
            ("tomato", "Tomato", "Early Blight", 91.0, "high", 18.5204, 73.8567, 1),
            ("tomato", "Tomato", "Early Blight", 88.0, "medium", 18.5301, 73.8476, 2),
            ("rice", "Rice", "Brown Spot", 84.0, "medium", 18.5074, 73.8077, 3),
            ("maize", "Maize", "Common Rust", 86.0, "medium", 18.5590, 73.7868, 5),
        ]

        for index, (
            crop,
            crop_label,
            disease,
            confidence,
            severity,
            latitude,
            longitude,
            days_ago,
        ) in enumerate(seeds, start=1):
            db.add(ScanRecord(
                user_id=user.id,
                crop=crop,
                crop_label=crop_label,
                field_label=f"Demo Alert Plot {index}",
                disease=disease,
                confidence=confidence,
                prediction_status="supported",
                severity=severity,
                health_score=compute_health_score(disease, confidence),
                image_path=None,
                state="Maharashtra",
                district="Pune",
                latitude=latitude,
                longitude=longitude,
                treatment_cost_min=700,
                treatment_cost_max=1400,
                created_at=now - timedelta(days=days_ago),
            ))

        db.commit()
        print("Seeded 4 demo alert scans for Pune, Maharashtra.")
    finally:
        db.close()


if __name__ == "__main__":
    main()

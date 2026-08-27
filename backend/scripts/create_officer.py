"""Provision or update an institutional officer account.

Run from backend/:
  python scripts/create_officer.py

Credentials are entered interactively; passwords are never written to source.
"""
from getpass import getpass
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from app.core.database import SessionLocal, init_db  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.user import User  # noqa: E402


def required(label: str) -> str:
    while True:
        value = input(f"{label}: " ).strip()
        if value:
            return value
        print(f"{label} is required.")


def main() -> None:
    init_db()
    institutional_id = required("Institutional ID").upper()
    full_name = required("Officer name")
    organisation = required("Organisation")
    designation = required("Designation")
    state = required("Access state")
    district = required("Access district")
    password = getpass("Password (12+ characters): " )
    if len(password) < 12:
        raise SystemExit("Password must be at least 12 characters.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.institutional_id == institutional_id).first()
        if user and user.role != "officer":
            raise SystemExit("That institutional ID is already used by a non-officer account.")
        if user is None:
            user = User(
                full_name=full_name, email=None, phone=None, role="officer",
                institutional_id=institutional_id, profile_completed=True, is_active=True,
            )
            db.add(user)
        user.full_name = full_name
        user.organisation = organisation
        user.designation = designation
        user.access_state = state
        user.access_district = district
        user.password_hash = hash_password(password)
        user.is_active = True
        db.commit()
        print(f"Officer account ready: {institutional_id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

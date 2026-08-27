from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password
)
from app.models.user import User
from app.models.officer_registration_request import OfficerRegistrationRequest


def get_user_by_identifier(db: Session, identifier: str):
    """
    Look a user up by email or phone - whichever was used to log in.
    """
    return db.query(User).filter(
        or_(User.email == identifier, User.phone == identifier)
    ).first()


def register_user(db: Session, data) -> User:
    if data.email and db.query(User).filter(
        User.email == data.email
    ).first():
        raise ValueError(
            "An account with this email already exists."
        )

    if data.phone and db.query(User).filter(
        User.phone == data.phone
    ).first():
        raise ValueError(
            "An account with this phone number already exists."
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        language=data.language
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, identifier: str, password: str):
    user = get_user_by_identifier(db, identifier)

    if (
        not user
        or user.role != "farmer"
        or not user.is_active
        or not verify_password(password, user.password_hash)
    ):
        return None

    return user


def authenticate_officer(db: Session, institutional_id: str, password: str):
    officer = db.query(User).filter(
        User.institutional_id == institutional_id.strip().upper(),
        User.role == "officer"
    ).first()

    if (
        not officer
        or not officer.is_active
        or not verify_password(password, officer.password_hash)
    ):
        return None

    return officer


def issue_token(user: User) -> str:
    return create_access_token(subject=user.id)


def create_officer_registration_request(db: Session, data) -> OfficerRegistrationRequest:
    institutional_id = data.institutional_id.strip().upper()
    official_email = str(data.official_email).strip().lower()

    existing_user = db.query(User).filter(
        User.institutional_id == institutional_id
    ).first()

    if existing_user:
        raise ValueError(
            "An officer account with this institutional ID already exists."
        )

    existing_request = db.query(OfficerRegistrationRequest).filter(
        OfficerRegistrationRequest.institutional_id == institutional_id,
        OfficerRegistrationRequest.status == "pending",
    ).first()

    if existing_request:
        raise ValueError(
            "A pending request already exists for this institutional ID."
        )

    request = OfficerRegistrationRequest(
        full_name=data.full_name.strip(),
        official_email=official_email,
        institutional_id=institutional_id,
        organisation=data.organisation.strip(),
        designation=data.designation.strip(),
        state=data.state.strip(),
        district=data.district.strip(),
        status="pending",
    )

    db.add(request)
    db.commit()
    db.refresh(request)
    return request

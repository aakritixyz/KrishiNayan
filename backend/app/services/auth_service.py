from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password
)
from app.models.user import User


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

    if not user or not verify_password(password, user.password_hash):
        return None

    return user


def issue_token(user: User) -> str:
    return create_access_token(subject=user.id)

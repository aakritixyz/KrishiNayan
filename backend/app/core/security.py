import bcrypt
import jwt

from datetime import datetime, timedelta, timezone

from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY
)


def hash_password(plain_password):
    """
    Hash a password with bcrypt. Never store or log plain_password.
    """
    password_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()

    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password, password_hash):
    """
    Check a plain-text password against a stored bcrypt hash.
    Returns False (never raises) if the hash is malformed.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except (ValueError, TypeError):
        return False


def create_access_token(subject):
    """
    Create a signed JWT for the given subject (the user id).
    """
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": str(subject),
        "exp": expires_at,
        "iat": datetime.now(timezone.utc)
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token):
    """
    Decode and verify a JWT. Returns the payload dict, or None if
    the token is missing, expired, or invalid in any way.
    """
    try:
        return jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        return None

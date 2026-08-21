from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


def _extract_token(authorization):
    if not authorization:
        return None

    parts = authorization.split()

    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]

    return None


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
) -> User:
    """
    Require a valid Bearer token. Raises 401 if missing/invalid/
    expired, or if the user it points to no longer exists. Use this
    on any route that must be logged-in-only.
    """
    token = _extract_token(authorization)
    payload = decode_access_token(token) if token else None

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.get(User, int(payload["sub"]))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    return user


def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
) -> User | None:
    """
    Best-effort current user: returns None instead of raising when
    there's no token or it's invalid. Use this on routes that stay
    open to anonymous use but should personalize when logged in.
    """
    token = _extract_token(authorization)

    if not token:
        return None

    payload = decode_access_token(token)

    if not payload:
        return None

    return db.get(User, int(payload["sub"]))

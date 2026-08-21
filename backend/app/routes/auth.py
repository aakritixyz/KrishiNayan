from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserOut,
    UserRegister
)

from app.services.auth_service import (
    authenticate_user,
    issue_token,
    register_user
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    try:
        user = register_user(db, payload)
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error

    token = issue_token(user)

    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(
        db,
        payload.identifier,
        payload.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email/phone or password."
        )

    token = issue_token(user)

    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user)
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    JWTs here are stateless, so logout is enforced by the client
    discarding the access token. This endpoint gives the frontend a
    clear, auth-checked call to make on sign-out, and leaves room
    for a server-side token blocklist later if needed.
    """
    return {
        "message": "Logged out. Discard the access token client-side."
    }


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

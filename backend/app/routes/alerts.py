from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user_optional
from app.models.user import User
from app.services.alert_service import nearby_cases


router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/nearby")
def nearby_alerts(
    latitude: float | None = Query(None, ge=-90, le=90),
    longitude: float | None = Query(None, ge=-180, le=180),
    radius_km: float = Query(25, ge=1, le=100),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    return nearby_cases(
        db,
        user=current_user if current_user and current_user.role == "farmer" else None,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
    )

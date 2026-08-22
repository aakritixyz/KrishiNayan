from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User

from app.services.health_service import get_crop_health_overview

router = APIRouter(prefix="/crop-health", tags=["crop-health"])


@router.get("/overview")
def crop_health_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Every crop/field the logged-in farmer has scanned, each with:
    - its full scan history (health score, disease, confidence,
      severity, over time)
    - the real point/percent health-score change since the
      previous scan
    - an improving/deteriorating/stable trend label
    - a simple "what's likely next" estimate, once there's enough
      history to support one (never fabricated when there isn't)

    Built entirely from this farmer's own stored scan records - a
    farmer with no scan history yet simply gets an empty list, which
    the frontend handles as a "build your history" empty state
    rather than an error.
    """
    return {"crops": get_crop_health_overview(db, current_user.id)}

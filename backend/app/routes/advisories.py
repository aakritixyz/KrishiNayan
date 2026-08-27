from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_farmer
from app.models.officer_advisory import OfficerAdvisory
from app.models.user import User

router = APIRouter(prefix="/advisories", tags=["advisories"])


@router.get("/nearby")
def nearby_advisories(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    query = db.query(OfficerAdvisory)

    if current_user.state:
        query = query.filter(OfficerAdvisory.state == current_user.state)
    else:
        return {"advisories": []}

    if current_user.district:
        query = query.filter(
            or_(
                OfficerAdvisory.district.is_(None),
                OfficerAdvisory.district == current_user.district,
            )
        )

    crops = {crop.lower() for crop in current_user.crops_list()}
    rows = query.order_by(OfficerAdvisory.created_at.desc()).limit(30).all()

    filtered = []
    for row in rows:
        if row.crop and crops and row.crop.lower() not in crops:
            continue
        filtered.append({
            "id": row.id,
            "title": row.title,
            "message": row.message,
            "crop": row.crop,
            "state": row.state,
            "district": row.district,
            "language": row.language,
            "created_at": row.created_at.isoformat(),
        })

    return {"advisories": filtered}

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_officer
from app.models.officer_advisory import OfficerAdvisory
from app.models.scan_record import ScanRecord
from app.models.user import User

router = APIRouter(prefix="/officer", tags=["officer"])


class AdvisoryCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    message: str = Field(..., min_length=5, max_length=1500)
    crop: str | None = None
    district: str | None = None
    language: str = "en"


def _scope_query(db: Session, officer: User):
    query = db.query(ScanRecord, User).join(User, User.id == ScanRecord.user_id)
    if officer.access_state:
        query = query.filter(User.state == officer.access_state)
    if officer.access_district:
        query = query.filter(User.district == officer.access_district)
    return query


@router.get("/overview")
def overview(
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    rows = _scope_query(db, current_user).all()
    now = datetime.now(timezone.utc)
    recent_cutoff = now - timedelta(days=7)

    total_scans = len(rows)
    farmers = {user.id for _, user in rows}
    disease_counts: dict[str, int] = {}
    crop_counts: dict[str, int] = {}
    recent_disease = 0
    high_risk = 0

    for scan, _user in rows:
        disease_counts[scan.disease] = disease_counts.get(scan.disease, 0) + 1
        crop_counts[scan.crop_label] = crop_counts.get(scan.crop_label, 0) + 1
        if scan.severity.lower() in {"high", "severe", "critical"}:
            high_risk += 1
        created = scan.created_at
        if created and created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if created and created >= recent_cutoff and scan.disease.lower() != "healthy":
            recent_disease += 1

    disease_breakdown = [
        {"disease": name, "count": count}
        for name, count in sorted(disease_counts.items(), key=lambda item: item[1], reverse=True)
    ]
    crop_breakdown = [
        {"crop": name, "count": count}
        for name, count in sorted(crop_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    top_disease = disease_breakdown[0]["disease"] if disease_breakdown else None

    return {
        "scope": {
            "state": current_user.access_state,
            "district": current_user.access_district,
            "organisation": current_user.organisation,
        },
        "summary": {
            "total_scans": total_scans,
            "unique_farmers": len(farmers),
            "recent_disease_scans": recent_disease,
            "high_risk_scans": high_risk,
            "top_disease": top_disease,
        },
        "disease_breakdown": disease_breakdown[:8],
        "crop_breakdown": crop_breakdown[:8],
    }


@router.get("/hotspots")
def hotspots(
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    query = db.query(
        User.district,
        ScanRecord.disease,
        func.count(ScanRecord.id).label("scan_count"),
        func.avg(ScanRecord.confidence).label("avg_confidence"),
    ).join(User, User.id == ScanRecord.user_id).filter(
        func.lower(ScanRecord.disease) != "healthy"
    )

    if current_user.access_state:
        query = query.filter(User.state == current_user.access_state)
    if current_user.access_district:
        query = query.filter(User.district == current_user.access_district)

    rows = query.group_by(User.district, ScanRecord.disease).order_by(
        func.count(ScanRecord.id).desc()
    ).limit(10).all()

    result = []
    for district, disease, count, confidence in rows:
        if count >= 10:
            priority = "critical"
        elif count >= 5:
            priority = "high"
        else:
            priority = "watch"
        result.append({
            "district": district or "Unknown district",
            "disease": disease,
            "scan_count": int(count),
            "average_confidence": round(float(confidence or 0), 3),
            "priority": priority,
        })

    return {"hotspots": result}


@router.get("/advisories")
def list_advisories(
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    rows = db.query(OfficerAdvisory).filter(
        OfficerAdvisory.officer_user_id == current_user.id
    ).order_by(OfficerAdvisory.created_at.desc()).limit(25).all()

    return {
        "advisories": [
            {
                "id": row.id,
                "title": row.title,
                "message": row.message,
                "crop": row.crop,
                "state": row.state,
                "district": row.district,
                "language": row.language,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]
    }


@router.post("/advisories", status_code=201)
def create_advisory(
    payload: AdvisoryCreate,
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    target_district = payload.district or current_user.access_district
    if current_user.access_district and target_district != current_user.access_district:
        raise HTTPException(status_code=403, detail="You can only publish within your assigned district.")

    advisory = OfficerAdvisory(
        officer_user_id=current_user.id,
        state=current_user.access_state or "Unassigned",
        district=target_district,
        crop=payload.crop.strip() if payload.crop else None,
        language=payload.language,
        title=payload.title.strip(),
        message=payload.message.strip(),
    )
    db.add(advisory)
    db.commit()
    db.refresh(advisory)
    return {"id": advisory.id, "message": "Advisory published."}

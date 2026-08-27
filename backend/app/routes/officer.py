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
    query = db.query(ScanRecord, User).join(
        User,
        User.id == ScanRecord.user_id
    )

    # Normalize location matching so values like "Pune" and "pune"
    # still match the officer's assigned scope.
    if officer.access_state:
        query = query.filter(
            func.lower(User.state) == officer.access_state.strip().lower()
        )

    if officer.access_district:
        query = query.filter(
            func.lower(User.district) == officer.access_district.strip().lower()
        )

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
        disease_name = (scan.disease or "").strip()
        disease_key = disease_name.lower()

        crop_label = (scan.crop_label or scan.crop or "Unknown").strip()
        crop_counts[crop_label] = crop_counts.get(crop_label, 0) + 1

        # Healthy scans should not appear in disease distribution / top disease.
        if disease_key and disease_key != "healthy":
            disease_counts[disease_name] = (
                disease_counts.get(disease_name, 0) + 1
            )

        created = scan.created_at
        if created and created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)

        is_recent = bool(created and created >= recent_cutoff)

        if is_recent and disease_key != "healthy":
            recent_disease += 1

        # High-risk card now represents high-risk scans in the same 7-day window.
        severity = (scan.severity or "").strip().lower()
        if (
            is_recent
            and severity in {"high", "severe", "critical"}
        ):
            high_risk += 1

    disease_breakdown = [
        {"disease": name, "count": count}
        for name, count in sorted(
            disease_counts.items(),
            key=lambda item: item[1],
            reverse=True
        )
    ]

    crop_breakdown = [
        {"crop": name, "count": count}
        for name, count in sorted(
            crop_counts.items(),
            key=lambda item: item[1],
            reverse=True
        )
    ]

    top_disease = (
        disease_breakdown[0]["disease"]
        if disease_breakdown
        else None
    )

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
    recent_cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    query = (
        db.query(
            User.district,
            ScanRecord.disease,
            func.count(ScanRecord.id).label("scan_count"),
            func.avg(ScanRecord.confidence).label("avg_confidence"),
            func.count(func.distinct(ScanRecord.user_id)).label("farmer_count"),
        )
        .join(User, User.id == ScanRecord.user_id)
        .filter(
            func.lower(ScanRecord.disease) != "healthy",
            ScanRecord.created_at >= recent_cutoff,
        )
    )

    if current_user.access_state:
        query = query.filter(
            func.lower(User.state)
            == current_user.access_state.strip().lower()
        )

    if current_user.access_district:
        query = query.filter(
            func.lower(User.district)
            == current_user.access_district.strip().lower()
        )

    rows = (
        query
        .group_by(User.district, ScanRecord.disease)
        .order_by(func.count(ScanRecord.id).desc())
        .limit(10)
        .all()
    )

    result = []

    for district, disease, count, confidence, farmer_count in rows:
        count = int(count)
        farmer_count = int(farmer_count or 0)
        avg_confidence = float(confidence or 0)

        # Rule-based priority using both scan volume and spread across farmers.
        if count >= 10 and farmer_count >= 5:
            priority = "critical"
        elif count >= 5 and farmer_count >= 3:
            priority = "high"
        else:
            priority = "watch"

        result.append(
            {
                "district": district or "Unknown district",
                "disease": disease,
                "scan_count": count,
                "farmer_count": farmer_count,
                "average_confidence": round(avg_confidence, 3),
                "priority": priority,
            }
        )

    return {"hotspots": result}


@router.get("/advisories")
def list_advisories(
    current_user: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(OfficerAdvisory)
        .filter(
            OfficerAdvisory.officer_user_id == current_user.id
        )
        .order_by(OfficerAdvisory.created_at.desc())
        .limit(25)
        .all()
    )

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
    target_district = (
        payload.district.strip()
        if payload.district
        else current_user.access_district
    )

    if (
        current_user.access_district
        and target_district
        and target_district.lower()
        != current_user.access_district.strip().lower()
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only publish within your assigned district."
        )

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

    return {
        "id": advisory.id,
        "message": "Advisory published."
    }

from datetime import datetime, timedelta, timezone
from math import asin, cos, radians, sin, sqrt

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.scan_record import ScanRecord


def _aware(value):
    if value and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _distance_km(lat1, lon1, lat2, lon2):
    radius = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    return 2 * radius * asin(sqrt(a))


def nearby_cases(
    db: Session,
    user=None,
    latitude: float | None = None,
    longitude: float | None = None,
    radius_km: float = 25,
):
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    query = db.query(ScanRecord).filter(
        func.lower(ScanRecord.disease) != "healthy",
        ScanRecord.created_at >= cutoff,
    )

    if user and user.state:
        query = query.filter(func.lower(ScanRecord.state) == user.state.lower())
        if user.district:
            query = query.filter(
                func.lower(ScanRecord.district) == user.district.lower()
            )

    records = query.order_by(ScanRecord.created_at.desc()).limit(100).all()
    center_lat = latitude
    center_lon = longitude

    if center_lat is None and user:
        center_lat = None
        center_lon = None

    cases = []
    for record in records:
        distance = None
        if (
            center_lat is not None
            and center_lon is not None
            and record.latitude is not None
            and record.longitude is not None
        ):
            distance = _distance_km(center_lat, center_lon, record.latitude, record.longitude)
            if distance > radius_km:
                continue

        cases.append({
            "id": record.id,
            "crop": record.crop,
            "crop_label": record.crop_label,
            "disease": record.disease,
            "severity": record.severity,
            "state": record.state,
            "district": record.district,
            "latitude": record.latitude,
            "longitude": record.longitude,
            "distance_km": round(distance, 1) if distance is not None else None,
            "created_at": record.created_at.isoformat(),
        })

    daily_counts = {}
    disease_counts = {}
    for case in cases:
        day = case["created_at"][:10]
        daily_counts[day] = daily_counts.get(day, 0) + 1
        disease_counts[case["disease"]] = disease_counts.get(case["disease"], 0) + 1

    top_disease = max(disease_counts.items(), key=lambda item: item[1])[0] if disease_counts else None
    high_count = sum(1 for case in cases if case["severity"].lower() == "high")
    risk_level = "High" if high_count >= 3 or len(cases) >= 5 else "Medium" if cases else "Low"

    return {
        "summary": {
            "case_count": len(cases),
            "affected_locations": len({
                (case["latitude"], case["longitude"], case["district"])
                for case in cases
            }),
            "risk_level": risk_level,
            "top_disease": top_disease,
            "radius_km": radius_km,
        },
        "daily_counts": [
            {"date": day, "count": daily_counts.get(day, 0)}
            for day in sorted(daily_counts)
        ],
        "cases": cases[:50],
    }

from sqlalchemy.orm import Session

from app.models.scan_record import ScanRecord


# A point-change smaller than this (in either direction) reads as
# "stable" rather than improving/deteriorating - this keeps ordinary
# scan-to-scan model noise from being reported as a real trend.
STABLE_THRESHOLD_POINTS = 3.0

# Minimum number of historical scans needed before we'll offer a
# "what's likely next" estimate. One or two points can't show a
# direction, so below this we simply omit the estimate.
MIN_POINTS_FOR_TREND_ESTIMATE = 3

# How many recent scan-to-scan deltas the "what's likely next"
# estimate averages over.
TREND_ESTIMATE_WINDOW = 4


def compute_health_score(disease, confidence):
    """
    A 0-100 health score derived ONLY from the model's own output -
    the predicted disease label and its confidence percentage
    (0-100) - never fabricated, randomized, or hardcoded.

    - Healthy diagnosis: the score scales directly with confidence,
      since the more sure the model is the plant is healthy, the
      better the signal.
    - Diseased diagnosis: the score is the inverse of the model's
      confidence in that disease, since the more sure the model is
      that a real problem exists, the worse the signal. This is
      clamped to a 5-95 range so a very confident diseased read can
      never tie with a genuinely healthy one, and a low-confidence
      diseased read is never mistaken for a clean bill of health.
    """
    if not disease or confidence is None:
        return 50.0

    if disease.strip().lower() == "healthy":
        return round(max(0.0, min(100.0, confidence)), 1)

    score = 100.0 - confidence

    return round(max(5.0, min(95.0, score)), 1)


def _trend_label(point_change):
    if point_change > STABLE_THRESHOLD_POINTS:
        return "improving"

    if point_change < -STABLE_THRESHOLD_POINTS:
        return "deteriorating"

    return "stable"


def compute_comparison(current_score, previous_score):
    """
    Real point/percent change between two actual health scores, and
    the resulting trend label. Returns "insufficient_data" for the
    trend (and None for the deltas) when there's no previous scan to
    compare against yet - this is the correct handling for a
    farmer's very first scan of a crop/field, not an error case.
    """
    if previous_score is None:
        return {
            "point_change": None,
            "percent_change": None,
            "trend": "insufficient_data"
        }

    point_change = round(current_score - previous_score, 1)

    percent_change = (
        round((point_change / previous_score) * 100, 1)
        if previous_score > 0
        else None
    )

    return {
        "point_change": point_change,
        "percent_change": percent_change,
        "trend": _trend_label(point_change)
    }


def estimate_next_trend(scores_oldest_to_newest):
    """
    A simple, transparent "what's likely next" estimate: the average
    of the most recent real scan-to-scan point changes, projected
    one step ahead from the current score. Returns None when there
    isn't enough history yet (fewer than MIN_POINTS_FOR_TREND_ESTIMATE
    scans) - we don't guess with too little data, per spec.
    """
    if len(scores_oldest_to_newest) < MIN_POINTS_FOR_TREND_ESTIMATE:
        return None

    deltas = [
        scores_oldest_to_newest[index] - scores_oldest_to_newest[index - 1]
        for index in range(1, len(scores_oldest_to_newest))
    ]

    recent_deltas = deltas[-TREND_ESTIMATE_WINDOW:]
    average_delta = sum(recent_deltas) / len(recent_deltas)

    current_score = scores_oldest_to_newest[-1]

    projected_score = round(
        max(0.0, min(100.0, current_score + average_delta)),
        1
    )

    return {
        "projected_next_score": projected_score,
        "direction": _trend_label(average_delta),
        "based_on_scans": len(recent_deltas) + 1
    }


def get_previous_scan(db: Session, user_id, crop, field_label):
    """
    The most recent existing scan for this crop/field, BEFORE any
    new scan is recorded. Callers must call this before record_scan
    for the same crop/field, or "previous" will incorrectly be the
    scan that's about to be inserted.
    """
    return (
        db.query(ScanRecord)
        .filter(
            ScanRecord.user_id == user_id,
            ScanRecord.crop == crop,
            ScanRecord.field_label == field_label
        )
        .order_by(ScanRecord.created_at.desc())
        .first()
    )


def record_scan(
    db: Session,
    user_id,
    crop,
    crop_label,
    field_label,
    disease,
    confidence,
    prediction_status,
    severity,
    image_path,
    plot_id=None,
    state=None,
    district=None,
    latitude=None,
    longitude=None,
    treatment_cost_min=None,
    treatment_cost_max=None,
):
    """
    Persist one completed scan as a new history point.
    """
    health_score = compute_health_score(disease, confidence)

    record = ScanRecord(
        user_id=user_id,
        crop=crop,
        crop_label=crop_label,
        field_label=field_label,
        disease=disease,
        confidence=confidence,
        prediction_status=prediction_status,
        severity=severity,
        health_score=health_score,
        image_path=image_path,
        plot_id=plot_id,
        state=state,
        district=district,
        latitude=latitude,
        longitude=longitude,
        treatment_cost_min=treatment_cost_min,
        treatment_cost_max=treatment_cost_max,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


def _serialize(record: ScanRecord):
    return {
        "id": record.id,
        "crop": record.crop,
        "crop_label": record.crop_label,
        "field_label": record.field_label,
        "disease": record.disease,
        "confidence": record.confidence,
        "prediction_status": record.prediction_status,
        "severity": record.severity,
        "health_score": record.health_score,
        "plot_id": record.plot_id,
        "state": record.state,
        "district": record.district,
        "latitude": record.latitude,
        "longitude": record.longitude,
        "treatment_cost_min": record.treatment_cost_min,
        "treatment_cost_max": record.treatment_cost_max,
        "created_at": record.created_at.isoformat()
    }


def get_crop_health_overview(db: Session, user_id):
    """
    Group every historical scan this farmer has ever run by
    (crop, field), each with its full ordered history, the real
    point/percent health-score change since the previous scan, an
    improving/deteriorating/stable trend label, and - once there's
    enough history - a simple "what's likely next" estimate. Built
    entirely from this farmer's own stored scan records.
    """
    records = (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == user_id)
        .order_by(ScanRecord.created_at.asc())
        .all()
    )

    groups: dict[tuple, list[ScanRecord]] = {}

    for record in records:
        key = (record.crop, record.field_label)
        groups.setdefault(key, []).append(record)

    overview = []

    for (crop, field_label), group_records in groups.items():
        history = [_serialize(record) for record in group_records]
        scores = [record.health_score for record in group_records]

        current = group_records[-1]
        previous = (
            group_records[-2] if len(group_records) > 1 else None
        )

        comparison = compute_comparison(
            current.health_score,
            previous.health_score if previous else None
        )

        overview.append({
            "crop": crop,
            "crop_label": current.crop_label,
            "field_label": field_label,
            "scan_count": len(group_records),
            "current": _serialize(current),
            "previous": (
                _serialize(previous) if previous else None
            ),
            "point_change": comparison["point_change"],
            "percent_change": comparison["percent_change"],
            "trend": comparison["trend"],
            "next_estimate": estimate_next_trend(scores),
            "history": history
        })

    overview.sort(
        key=lambda item: item["current"]["created_at"],
        reverse=True
    )

    return overview

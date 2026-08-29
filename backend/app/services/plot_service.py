from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import CROP_CONFIG
from app.models.farm_plot import FarmPlot
from app.models.scan_record import ScanRecord


def _crop_label(crop: str):
    key = crop.strip().lower()
    if key not in CROP_CONFIG:
        supported = ", ".join(sorted(CROP_CONFIG))
        raise ValueError(f"Unsupported crop '{crop}'. Supported crops: {supported}.")
    return key, CROP_CONFIG[key]["label"]


def serialize_plot(plot: FarmPlot, latest_scan: ScanRecord | None = None):
    return {
        "id": plot.id,
        "name": plot.name,
        "crop": plot.crop,
        "crop_label": plot.crop_label,
        "growth_stage": plot.growth_stage,
        "sowing_date": plot.sowing_date.isoformat() if plot.sowing_date else None,
        "area_acres": plot.area_acres,
        "state": plot.state,
        "district": plot.district,
        "village": plot.village,
        "latitude": plot.latitude,
        "longitude": plot.longitude,
        "latest_scan": (
            {
                "id": latest_scan.id,
                "disease": latest_scan.disease,
                "severity": latest_scan.severity,
                "health_score": latest_scan.health_score,
                "created_at": latest_scan.created_at.isoformat(),
            }
            if latest_scan
            else None
        ),
        "created_at": plot.created_at.isoformat(),
        "updated_at": plot.updated_at.isoformat(),
    }


def list_plots(db: Session, user_id: int):
    plots = (
        db.query(FarmPlot)
        .filter(FarmPlot.user_id == user_id)
        .order_by(FarmPlot.updated_at.desc())
        .all()
    )
    latest_by_plot = {}
    if plots:
        records = (
            db.query(ScanRecord)
            .filter(
                ScanRecord.user_id == user_id,
                ScanRecord.plot_id.in_([plot.id for plot in plots]),
            )
            .order_by(ScanRecord.created_at.desc())
            .all()
        )
        for record in records:
            latest_by_plot.setdefault(record.plot_id, record)

    return [serialize_plot(plot, latest_by_plot.get(plot.id)) for plot in plots]


def get_plot(db: Session, user_id: int, plot_id: int):
    return (
        db.query(FarmPlot)
        .filter(FarmPlot.id == plot_id, FarmPlot.user_id == user_id)
        .first()
    )


def create_plot(db: Session, user_id: int, data):
    crop, label = _crop_label(data.crop)
    plot = FarmPlot(
        user_id=user_id,
        name=data.name.strip(),
        crop=crop,
        crop_label=label,
        growth_stage=data.growth_stage,
        sowing_date=data.sowing_date,
        area_acres=data.area_acres,
        state=data.state,
        district=data.district,
        village=data.village,
        latitude=data.latitude,
        longitude=data.longitude,
    )
    db.add(plot)
    db.commit()
    db.refresh(plot)
    return plot


def update_plot(db: Session, plot: FarmPlot, data):
    values = data.model_dump(exclude_unset=True)
    if "crop" in values and values["crop"]:
        crop, label = _crop_label(values["crop"])
        values["crop"] = crop
        values["crop_label"] = label

    for key, value in values.items():
        setattr(plot, key, value.strip() if isinstance(value, str) else value)

    plot.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plot)
    return plot


def delete_plot(db: Session, plot: FarmPlot):
    db.delete(plot)
    db.commit()

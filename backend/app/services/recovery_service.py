from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.recovery import RecoveryPlan, RecoveryTask
from app.models.scan_record import ScanRecord


def _task_templates(disease: str, recommended_action: str):
    if disease.strip().lower() == "healthy":
        return []

    return [
        (1, "Disease identified", "Review the scan result and isolate affected leaves if possible.", None),
        (2, "Remove affected leaves", "Remove infected leaves and keep them away from healthy plants.", "7-9 AM"),
        (3, "Apply recommended treatment", recommended_action, "7-9 AM"),
        (5, "Check new leaf growth", "Inspect new leaves and note whether spots are spreading.", None),
        (7, "Scan crop again", "Upload a follow-up photo to compare recovery progress.", None),
    ]


def serialize_plan(plan: RecoveryPlan, tasks: list[RecoveryTask]):
    completed = sum(1 for task in tasks if task.completed)
    total = len(tasks)
    return {
        "id": plan.id,
        "plot_id": plan.plot_id,
        "scan_record_id": plan.scan_record_id,
        "crop": plan.crop,
        "crop_label": plan.crop_label,
        "disease": plan.disease,
        "status": plan.status,
        "progress_percent": round((completed / total) * 100) if total else 0,
        "created_at": plan.created_at.isoformat(),
        "tasks": [
            {
                "id": task.id,
                "day": task.day,
                "title": task.title,
                "description": task.description,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "best_time": task.best_time,
                "completed": task.completed,
                "completed_at": task.completed_at.isoformat()
                if task.completed_at
                else None,
            }
            for task in tasks
        ],
    }


def create_plan_for_scan(
    db: Session,
    scan: ScanRecord,
    recommended_action: str,
):
    existing = (
        db.query(RecoveryPlan)
        .filter(RecoveryPlan.scan_record_id == scan.id)
        .first()
    )
    if existing:
        tasks = (
            db.query(RecoveryTask)
            .filter(RecoveryTask.plan_id == existing.id)
            .order_by(RecoveryTask.day.asc())
            .all()
        )
        return existing, tasks

    templates = _task_templates(scan.disease, recommended_action)
    if not templates:
        return None, []

    plan = RecoveryPlan(
        user_id=scan.user_id,
        plot_id=scan.plot_id,
        scan_record_id=scan.id,
        crop=scan.crop,
        crop_label=scan.crop_label,
        disease=scan.disease,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    start = date.today()
    tasks = [
        RecoveryTask(
            plan_id=plan.id,
            day=day,
            title=title,
            description=description,
            due_date=start + timedelta(days=day - 1),
            best_time=best_time,
            completed=(day == 1),
            completed_at=datetime.now(timezone.utc) if day == 1 else None,
        )
        for day, title, description, best_time in templates
    ]
    db.add_all(tasks)
    db.commit()
    return plan, tasks


def latest_plan(db: Session, user_id: int):
    plan = (
        db.query(RecoveryPlan)
        .filter(RecoveryPlan.user_id == user_id)
        .order_by(RecoveryPlan.created_at.desc())
        .first()
    )
    if not plan:
        return None
    tasks = (
        db.query(RecoveryTask)
        .filter(RecoveryTask.plan_id == plan.id)
        .order_by(RecoveryTask.day.asc())
        .all()
    )
    return serialize_plan(plan, tasks)


def get_plan(db: Session, user_id: int, plan_id: int):
    plan = (
        db.query(RecoveryPlan)
        .filter(RecoveryPlan.id == plan_id, RecoveryPlan.user_id == user_id)
        .first()
    )
    if not plan:
        return None
    tasks = (
        db.query(RecoveryTask)
        .filter(RecoveryTask.plan_id == plan.id)
        .order_by(RecoveryTask.day.asc())
        .all()
    )
    return serialize_plan(plan, tasks)


def set_task_completion(db: Session, user_id: int, task_id: int, completed: bool):
    row = (
        db.query(RecoveryTask, RecoveryPlan)
        .join(RecoveryPlan, RecoveryPlan.id == RecoveryTask.plan_id)
        .filter(RecoveryTask.id == task_id, RecoveryPlan.user_id == user_id)
        .first()
    )
    if not row:
        return None
    task, plan = row
    task.completed = completed
    task.completed_at = datetime.now(timezone.utc) if completed else None
    db.commit()
    return get_plan(db, user_id, plan.id)


def upcoming_reminders(db: Session, user_id: int):
    today = date.today()
    rows = (
        db.query(RecoveryTask, RecoveryPlan)
        .join(RecoveryPlan, RecoveryPlan.id == RecoveryTask.plan_id)
        .filter(
            RecoveryPlan.user_id == user_id,
            RecoveryTask.completed == False,  # noqa: E712
            RecoveryTask.due_date >= today,
        )
        .order_by(RecoveryTask.due_date.asc())
        .limit(10)
        .all()
    )
    return [
        {
            "task_id": task.id,
            "plan_id": plan.id,
            "crop_label": plan.crop_label,
            "disease": plan.disease,
            "title": task.title,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "best_time": task.best_time,
        }
        for task, plan in rows
    ]

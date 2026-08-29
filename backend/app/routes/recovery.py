from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_farmer
from app.models.user import User
from app.services import recovery_service


router = APIRouter(prefix="/recovery", tags=["recovery"])


class TaskUpdate(BaseModel):
    completed: bool


@router.get("/latest")
def latest_recovery_plan(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    return {"plan": recovery_service.latest_plan(db, current_user.id)}


@router.get("/reminders/upcoming")
def upcoming_reminders(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    return {"reminders": recovery_service.upcoming_reminders(db, current_user.id)}


@router.get("/{plan_id}")
def get_recovery_plan(
    plan_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    plan = recovery_service.get_plan(db, current_user.id, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Recovery plan not found.")
    return {"plan": plan}


@router.patch("/tasks/{task_id}")
def update_recovery_task(
    task_id: int,
    payload: TaskUpdate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    plan = recovery_service.set_task_completion(
        db, current_user.id, task_id, payload.completed
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Recovery task not found.")
    return {"plan": plan}


from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_farmer
from app.models.user import User
from app.services import plot_service


router = APIRouter(prefix="/plots", tags=["plots"])


class PlotCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    crop: str = Field(..., min_length=1)
    growth_stage: str | None = None
    sowing_date: date | None = None
    area_acres: float | None = Field(None, ge=0)
    state: str | None = None
    district: str | None = None
    village: str | None = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)


class PlotUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=80)
    crop: str | None = Field(None, min_length=1)
    growth_stage: str | None = None
    sowing_date: date | None = None
    area_acres: float | None = Field(None, ge=0)
    state: str | None = None
    district: str | None = None
    village: str | None = None
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)


@router.get("")
def list_plots(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    return {"plots": plot_service.list_plots(db, current_user.id)}


@router.post("", status_code=201)
def create_plot(
    payload: PlotCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    try:
        plot = plot_service.create_plot(db, current_user.id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"plot": plot_service.serialize_plot(plot)}


@router.put("/{plot_id}")
def update_plot(
    plot_id: int,
    payload: PlotUpdate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    plot = plot_service.get_plot(db, current_user.id, plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found.")

    try:
        updated = plot_service.update_plot(db, plot, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"plot": plot_service.serialize_plot(updated)}


@router.delete("/{plot_id}", status_code=204)
def delete_plot(
    plot_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    plot = plot_service.get_plot(db, current_user.id, plot_id)
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found.")
    plot_service.delete_plot(db, plot)
    return None

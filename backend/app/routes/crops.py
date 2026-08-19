from fastapi import APIRouter

from app.core.config import CROP_CONFIG

router = APIRouter(prefix="/crops", tags=["crops"])


@router.get("")
def list_crops():
    """
    Return every crop the app knows about, and whether that crop's
    model file is actually present yet (so the frontend can grey
    out crops that haven't been trained/uploaded yet).
    """
    crops = []

    for crop_key, settings in CROP_CONFIG.items():
        crops.append({
            "id": crop_key,
            "label": settings["label"],
            "available": settings["model_path"].exists()
        })

    return {"crops": crops}

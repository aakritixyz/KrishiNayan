import json
from functools import lru_cache
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parents[2] / "data"

# Maps crop -> the JSON file with real Soil Health Card advisory
# data for that crop. Add an entry here as more real per-crop
# datasets are sourced.
CROP_ADVISORY_FILES = {
    "maize": DATA_DIR / "maize" / "maize_bihar_soil_advisory.json",
    "rice": DATA_DIR / "rice" / "rice_telangana_soil_advisory.json",
}


def _normalize_entry(raw: dict) -> dict:
    """
    Different team members' datasets use slightly different field
    names (e.g. "recommendation" vs "soil_recommendation", with or
    without a nested soil_profile breakdown). Normalize them all to
    one consistent shape so the API returns the same structure
    regardless of which file an entry came from.
    """
    recommendation = (
        raw.get("recommendation")
        or raw.get("soil_recommendation")
        or ""
    )

    source = raw.get("source")
    if isinstance(source, list):
        source = ", ".join(source)

    return {
        "state": raw.get("state"),
        "crop": raw.get("crop"),
        "district": raw.get("district"),
        "soil_profile": raw.get("soil_profile"),
        "soil_risk_summary": raw.get("soil_risk_summary"),
        "recommendation": recommendation,
        "farmer_message": raw.get("farmer_message") or recommendation,
        "source": source or "Soil Health Card dataset",
    }


@lru_cache(maxsize=None)
def _load_crop_advisory(crop: str):
    file_path = CROP_ADVISORY_FILES.get(crop)

    if file_path is None or not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as file:
        raw_entries = json.load(file)

    return [_normalize_entry(entry) for entry in raw_entries]


def get_supported_advisory_crops():
    """
    Return the list of crops that have real Soil Health Card
    advisory data available (as opposed to the generic
    representative soil_profiles.json used elsewhere).
    """
    return sorted(
        crop for crop, path in CROP_ADVISORY_FILES.items()
        if path.exists()
    )


def get_advisory_districts(crop: str):
    """
    Return the districts covered by the real advisory dataset for
    a crop, e.g. all 38 Bihar districts for maize and 5 Telangana
    districts for rice.
    """
    entries = _load_crop_advisory(crop.lower())
    return sorted({entry["district"] for entry in entries})


def get_crop_soil_advisory(crop: str, district: str):
    """
    Return the real Soil Health Card-based advisory for a given
    crop + district, or None if not covered.
    """
    entries = _load_crop_advisory(crop.lower())

    for entry in entries:
        if entry["district"].lower() == district.lower():
            return entry

    return None

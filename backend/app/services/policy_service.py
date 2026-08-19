import json

from functools import lru_cache

from app.core.config import POLICIES_DATA_PATH


@lru_cache(maxsize=1)
def load_policies():
    """
    Load the curated government scheme dataset.
    Cached in memory after the first read.
    """
    if not POLICIES_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Policy dataset not found: {POLICIES_DATA_PATH}"
        )

    with open(
        POLICIES_DATA_PATH,
        "r",
        encoding="utf-8"
    ) as file:
        data = json.load(file)

    schemes = data.get("schemes")

    if not schemes:
        raise ValueError(
            "No schemes found in policies.json"
        )

    return schemes


def _excluded_category_match(profile, excluded_categories):
    """
    True if the farmer self-identified with a category this
    scheme explicitly excludes (e.g. income-tax payee).
    """
    if not excluded_categories:
        return None

    farmer_flags = set(
        profile.get("excluded_categories") or []
    )

    matched = farmer_flags.intersection(excluded_categories)

    return matched or None


def check_eligibility(scheme, profile):
    """
    Soft eligibility check for one scheme against a farmer profile.

    Returns (is_eligible, relevance_score 0-100, reasons: list[str]).
    This is a helpful pre-screen, not a legal determination - the
    scheme's official portal always has the final word.
    """
    eligibility = scheme["eligibility"]
    reasons = []

    excluded_match = _excluded_category_match(
        profile,
        eligibility.get("excluded_categories")
    )

    if excluded_match:
        return (
            False,
            0.0,
            [
                "You indicated a category this scheme excludes: "
                + ", ".join(sorted(excluded_match))
            ]
        )

    land_holding = profile.get("land_holding_acres")
    max_land = eligibility.get("max_land_holding_acres")

    if (
        land_holding is not None
        and max_land is not None
        and land_holding > max_land
    ):
        return (
            False,
            0.0,
            [
                f"Your land holding ({land_holding} acres) is above "
                f"the {max_land} acre limit for this scheme."
            ]
        )

    score = 50.0

    applicable_crops = [
        crop.lower()
        for crop in (eligibility.get("applicable_crops") or [])
    ]

    crop = (profile.get("crop") or "").strip().lower()

    if applicable_crops:
        crop_covered = (
            "any" in applicable_crops
            or any(
                crop and crop in listed
                for listed in applicable_crops
            )
        )

        if crop_covered:
            score += 20
            reasons.append(
                f"Covers {profile.get('crop', 'your crop')}."
            )

    farmer_types = [
        ftype.lower()
        for ftype in (eligibility.get("farmer_types") or [])
    ]

    category = (profile.get("category") or "").strip().lower()

    if category and farmer_types:
        if category in farmer_types:
            score += 15
            reasons.append(
                "Matches your farmer category "
                f"('{profile.get('category')}')."
            )

    if (
        eligibility.get("requires_bank_account")
        and profile.get("has_bank_account") is False
    ):
        score -= 10
        reasons.append(
            "You'll need a bank account to receive this benefit."
        )

    if (
        eligibility.get("requires_aadhaar")
        and profile.get("has_aadhaar") is False
    ):
        score -= 10
        reasons.append(
            "You'll need an Aadhaar card to apply."
        )

    if not reasons:
        reasons.append(
            "Generally open to farmers across India - "
            "check the official portal for full terms."
        )

    score = max(0.0, min(100.0, score))

    return True, score, reasons


def get_eligible_schemes(profile):
    """
    Score every scheme against the farmer profile and return them
    ranked: eligible schemes first (highest relevance first), then
    schemes the farmer likely doesn't qualify for.
    """
    schemes = load_policies()

    results = []

    for scheme in schemes:
        is_eligible, score, reasons = check_eligibility(
            scheme,
            profile
        )

        results.append({
            "scheme": scheme,
            "eligible": is_eligible,
            "relevance_score": round(score, 1),
            "match_reasons": reasons
        })

    results.sort(
        key=lambda result: (
            not result["eligible"],
            -result["relevance_score"]
        )
    )

    return results

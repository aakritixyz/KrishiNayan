import json
from functools import lru_cache

from app.core.config import POLICIES_DATA_PATH

SUPPORTED_LANGUAGES = {"en", "hi", "pa", "mr"}
DEFAULT_LANGUAGE = "en"


@lru_cache(maxsize=1)
def load_policies():
    """
    Load the curated multilingual government scheme dataset.
    Cached in memory after the first read.
    """
    if not POLICIES_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Policy dataset not found: {POLICIES_DATA_PATH}"
        )

    with open(POLICIES_DATA_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    schemes = data.get("schemes")

    if not schemes:
        raise ValueError("No schemes found in policies.json")

    return schemes


def _language(value):
    language = (value or DEFAULT_LANGUAGE).strip().lower()
    return language if language in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


def _localize(value, language):
    """
    Resolve a multilingual value to the selected language.

    Supports:
    - {"en": "...", "hi": "...", "pa": "...", "mr": "..."}
    - lists containing multilingual values
    - ordinary strings/numbers unchanged
    """
    language = _language(language)

    if isinstance(value, dict) and "en" in value:
        return value.get(language) or value.get("en") or ""

    if isinstance(value, list):
        return [_localize(item, language) for item in value]

    return value


def _localized_scheme(scheme, language):
    """
    Return only display-facing scheme fields in the requested language,
    while keeping machine-readable eligibility/source fields unchanged.
    """
    language = _language(language)
    result = dict(scheme)

    for field in (
        "name",
        "category",
        "administering_body",
        "short_description",
        "benefits",
        "required_documents",
        "application_mode",
        "helpline",
    ):
        if field in result:
            result[field] = _localize(result[field], language)

    return result


def _t(language, en, hi, pa, mr):
    language = _language(language)
    return {
        "en": en,
        "hi": hi,
        "pa": pa,
        "mr": mr,
    }[language]


def _crop_name(crop, language):
    names = {
        "tomato": {"en": "Tomato", "hi": "टमाटर", "pa": "ਟਮਾਟਰ", "mr": "टोमॅटो"},
        "maize": {"en": "Maize", "hi": "मक्का", "pa": "ਮੱਕੀ", "mr": "मका"},
        "rice": {"en": "Rice", "hi": "धान", "pa": "ਧਾਨ", "mr": "भात"},
    }
    key = (crop or "").strip().lower()
    return names.get(key, {}).get(_language(language), crop or "")


def _category_name(category, language):
    names = {
        "small": {"en": "small", "hi": "लघु", "pa": "ਛੋਟਾ", "mr": "लहान"},
        "marginal": {"en": "marginal", "hi": "सीमांत", "pa": "ਸੀਮਾਂਤ", "mr": "अल्पभूधारक"},
        "general": {"en": "general", "hi": "सामान्य", "pa": "ਆਮ", "mr": "सामान्य"},
        "tenant": {"en": "tenant", "hi": "किरायेदार", "pa": "ਕਿਰਾਏਦਾਰ", "mr": "भाडेकरू"},
        "sharecropper": {"en": "sharecropper", "hi": "बटाईदार", "pa": "ਹਿੱਸੇਦਾਰ ਕਿਸਾਨ", "mr": "वाटेकरी शेतकरी"},
    }
    key = (category or "").strip().lower()
    return names.get(key, {}).get(_language(language), category or "")


def _excluded_category_match(profile, excluded_categories):
    if not excluded_categories:
        return None

    farmer_flags = set(profile.get("excluded_categories") or [])
    matched = farmer_flags.intersection(excluded_categories)
    return matched or None


def check_eligibility(scheme, profile, language="en"):
    """
    Soft eligibility check for one scheme against a farmer profile.

    Dynamic reason strings are generated directly in the selected language.
    """
    language = _language(language)
    eligibility = scheme["eligibility"]
    reasons = []

    excluded_match = _excluded_category_match(
        profile,
        eligibility.get("excluded_categories"),
    )

    if excluded_match:
        excluded_text = ", ".join(sorted(excluded_match))
        return (
            False,
            0.0,
            [
                _t(
                    language,
                    f"You indicated a category this scheme excludes: {excluded_text}",
                    f"आपने ऐसी श्रेणी चुनी है जिसे यह योजना बाहर रखती है: {excluded_text}",
                    f"ਤੁਸੀਂ ਉਹ ਸ਼੍ਰੇਣੀ ਦਰਸਾਈ ਹੈ ਜਿਸਨੂੰ ਇਹ ਯੋਜਨਾ ਬਾਹਰ ਰੱਖਦੀ ਹੈ: {excluded_text}",
                    f"तुम्ही अशी श्रेणी नमूद केली आहे जी ही योजना वगळते: {excluded_text}",
                )
            ],
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
                _t(
                    language,
                    f"Your land holding ({land_holding} acres) is above the {max_land} acre limit for this scheme.",
                    f"आपकी भूमि जोत ({land_holding} एकड़) इस योजना की {max_land} एकड़ सीमा से अधिक है।",
                    f"ਤੁਹਾਡੀ ਜ਼ਮੀਨ ਹੋਲਡਿੰਗ ({land_holding} ਏਕੜ) ਇਸ ਯੋਜਨਾ ਦੀ {max_land} ਏਕੜ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹੈ।",
                    f"तुमची जमीन धारणा ({land_holding} एकर) या योजनेच्या {max_land} एकर मर्यादेपेक्षा जास्त आहे.",
                )
            ],
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
            or any(crop and crop in listed for listed in applicable_crops)
        )

        if crop_covered:
            score += 20
            crop_display = _crop_name(profile.get("crop"), language)
            reasons.append(
                _t(
                    language,
                    f"Covers {crop_display or 'your crop'}.",
                    f"{crop_display or 'आपकी फसल'} इस योजना में शामिल है।",
                    f"{crop_display or 'ਤੁਹਾਡੀ ਫਸਲ'} ਇਸ ਯੋਜਨਾ ਵਿੱਚ ਸ਼ਾਮਲ ਹੈ।",
                    f"{crop_display or 'तुमचे पीक'} या योजनेत समाविष्ट आहे.",
                )
            )

    farmer_types = [
        ftype.lower()
        for ftype in (eligibility.get("farmer_types") or [])
    ]

    category = (profile.get("category") or "").strip().lower()

    if category and farmer_types and category in farmer_types:
        score += 15
        category_display = _category_name(category, language)
        reasons.append(
            _t(
                language,
                f"Matches your farmer category ('{category_display}').",
                f"आपकी किसान श्रेणी ('{category_display}') से मेल खाता है।",
                f"ਤੁਹਾਡੀ ਕਿਸਾਨ ਸ਼੍ਰੇਣੀ ('{category_display}') ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਹੈ।",
                f"तुमच्या शेतकरी श्रेणीशी ('{category_display}') जुळते.",
            )
        )

    if (
        eligibility.get("requires_bank_account")
        and profile.get("has_bank_account") is False
    ):
        score -= 10
        reasons.append(
            _t(
                language,
                "You'll need a bank account to receive this benefit.",
                "यह लाभ प्राप्त करने के लिए बैंक खाता आवश्यक है।",
                "ਇਹ ਲਾਭ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਬੈਂਕ ਖਾਤਾ ਲਾਜ਼ਮੀ ਹੈ।",
                "हा लाभ मिळवण्यासाठी बँक खाते आवश्यक आहे.",
            )
        )

    if (
        eligibility.get("requires_aadhaar")
        and profile.get("has_aadhaar") is False
    ):
        score -= 10
        reasons.append(
            _t(
                language,
                "You'll need an Aadhaar card to apply.",
                "आवेदन करने के लिए आधार कार्ड आवश्यक है।",
                "ਅਰਜ਼ੀ ਦੇਣ ਲਈ ਆਧਾਰ ਕਾਰਡ ਲਾਜ਼ਮੀ ਹੈ।",
                "अर्ज करण्यासाठी आधार कार्ड आवश्यक आहे.",
            )
        )

    if not reasons:
        reasons.append(
            _t(
                language,
                "Generally open to farmers across India - check the official portal for full terms.",
                "आम तौर पर पूरे भारत के किसानों के लिए उपलब्ध - पूरी शर्तों के लिए आधिकारिक पोर्टल देखें।",
                "ਆਮ ਤੌਰ ਤੇ ਭਾਰਤ ਭਰ ਦੇ ਕਿਸਾਨਾਂ ਲਈ ਉਪਲਬਧ - ਪੂਰੀਆਂ ਸ਼ਰਤਾਂ ਲਈ ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਵੇਖੋ।",
                "साधारणपणे भारतभरातील शेतकऱ्यांसाठी उपलब्ध - संपूर्ण अटींसाठी अधिकृत पोर्टल पहा.",
            )
        )

    score = max(0.0, min(100.0, score))
    return True, score, reasons


def get_eligible_schemes(profile, language=None):
    """
    Score schemes and return every display-facing field in the requested
    language. `language` may be supplied explicitly or inside profile.
    """
    language = _language(language or profile.get("language"))
    schemes = load_policies()
    results = []

    for scheme in schemes:
        is_eligible, score, reasons = check_eligibility(
            scheme,
            profile,
            language,
        )

        results.append(
            {
                "scheme": _localized_scheme(scheme, language),
                "eligible": is_eligible,
                "relevance_score": round(score, 1),
                "match_reasons": reasons,
            }
        )

    results.sort(
        key=lambda result: (
            not result["eligible"],
            -result["relevance_score"],
        )
    )

    return results

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_list_policies_returns_sourced_schemes():
    response = client.get("/policies")

    assert response.status_code == 200

    schemes = response.json()["schemes"]

    assert len(schemes) > 0

    for scheme in schemes:
        assert scheme["official_link"].startswith("https://")
        assert scheme["source_urls"]
        assert scheme["last_verified"]
        assert scheme["required_documents"]


def test_eligible_policies_ranks_matching_scheme_first():
    response = client.post(
        "/policies/eligible",
        json={
            "state": "Maharashtra",
            "land_holding_acres": 2,
            "crop": "Tomato",
            "category": "small",
            "has_bank_account": True,
            "has_aadhaar": True
        }
    )

    assert response.status_code == 200

    results = response.json()["results"]

    assert len(results) > 0

    # Eligible schemes must be ranked before ineligible ones.
    eligible_flags = [item["eligible"] for item in results]
    assert eligible_flags == sorted(
        eligible_flags,
        key=lambda flag: not flag
    )

    top_scheme = results[0]
    assert top_scheme["eligible"] is True
    assert top_scheme["relevance_score"] > 0
    assert top_scheme["match_reasons"]


def test_eligible_policies_excludes_disqualified_category():
    response = client.post(
        "/policies/eligible",
        json={
            "land_holding_acres": 1,
            "crop": "Tomato",
            "excluded_categories": ["income_tax_payees"]
        }
    )

    assert response.status_code == 200

    results = response.json()["results"]

    pm_kisan = next(
        item for item in results
        if item["scheme"]["id"] == "pm-kisan"
    )

    assert pm_kisan["eligible"] is False
    assert pm_kisan["relevance_score"] == 0

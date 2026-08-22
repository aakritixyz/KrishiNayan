from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_chatbot_answers_relevant_question_with_sources():
    response = client.post(
        "/chatbot/ask",
        json={
            "message": (
                "My tomato leaves have brown spots with rings, "
                "what should I do?"
            ),
            "language": "en",
            "context": {
                "crop": "Tomato",
                "stage": "Flowering",
                "location": "Pune, Maharashtra",
                "diagnosis": {
                    "disease": "Early Blight",
                    "confidence": 91.2
                },
                "weather": {
                    "temperature": 27,
                    "humidity": 82,
                    "wind_speed": 5,
                    "rain_expected": False
                }
            }
        }
    )

    assert response.status_code == 200

    result = response.json()

    assert result["clarifying_question"] is None
    assert result["sources"]
    assert "early_blight" in result["matched_topics"]
    assert len(result["answer"]) > 0


def test_chatbot_asks_clarifying_question_for_irrelevant_input():
    response = client.post(
        "/chatbot/ask",
        json={
            "message": "asdkj qwepoiu random text",
            "language": "en"
        }
    )

    assert response.status_code == 200

    result = response.json()

    assert result["clarifying_question"] is not None
    assert result["sources"] == []
    assert result["used_llm"] is False


def test_chatbot_supports_hindi_language():
    response = client.post(
        "/chatbot/ask",
        json={
            "message": "tomato irrigation watering schedule",
            "language": "hi"
        }
    )

    assert response.status_code == 200

    result = response.json()

    assert result["language"] == "hi"


def test_chatbot_personalizes_using_logged_in_profile():
    register_response = client.post(
        "/auth/register",
        json={
            "full_name": "Chat Test Farmer",
            "email": "chatbot.profile@example.com",
            "password": "Farmer@123"
        }
    )

    token = register_response.json()["access_token"]

    client.put(
        "/profile",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "state": "Maharashtra",
            "district": "Pune",
            "village": "Wagholi",
            "farm_size_acres": 2,
            "crops": ["Tomato"],
            "irrigation_type": "drip",
            "language": "hi"
        }
    )

    response = client.post(
        "/chatbot/ask",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "irrigation watering schedule"}
    )

    assert response.status_code == 200

    result = response.json()

    # No language was sent in the request - it should fall back to
    # the farmer's saved profile language ("hi").
    assert result["language"] == "hi"


def test_chatbot_still_works_without_login():
    response = client.post(
        "/chatbot/ask",
        json={"message": "irrigation watering schedule"}
    )

    assert response.status_code == 200
    assert response.json()["language"] == "en"


def test_chatbot_uses_diagnosis_for_vague_follow_up_question():
    """
    A vague follow-up like "what should I do?" carries no useful
    retrieval keywords on its own - the chatbot must fall back on
    the diagnosis already in context (disease + crop) to find
    relevant guidance, instead of asking a diagnosis-blind
    clarifying question or answering generically.
    """
    response = client.post(
        "/chatbot/ask",
        json={
            "message": "what should I do?",
            "language": "en",
            "context": {
                "crop": "Tomato",
                "diagnosis": {
                    "disease": "Early Blight",
                    "confidence": 91.2,
                    "severity": "High"
                }
            }
        }
    )

    assert response.status_code == 200

    result = response.json()

    assert result["clarifying_question"] is None
    assert "early_blight" in result["matched_topics"]
    # The answer must visibly acknowledge the specific diagnosis,
    # not read as generic advice with no memory of the analysis.
    assert "Early Blight" in result["answer"]


def test_chatbot_answer_names_known_diagnosis_even_for_odd_wording():
    """
    Even for oddly-worded input, if we already know the diagnosis,
    retrieval is augmented with it - so the chatbot still finds and
    names the specific disease rather than falling back to a
    diagnosis-blind generic response.
    """
    response = client.post(
        "/chatbot/ask",
        json={
            "message": "zzz qqq unrelated nonsense",
            "language": "en",
            "context": {
                "crop": "Tomato",
                "diagnosis": {
                    "disease": "Late Blight",
                    "confidence": 88.0
                }
            }
        }
    )

    assert response.status_code == 200

    result = response.json()

    # The diagnosis context alone was enough to find real guidance -
    # either as a direct answer naming it, or (if it still couldn't
    # find anything) a clarifying question that names it. Either way
    # "Late Blight" must appear somewhere in the reply.
    assert "Late Blight" in result["answer"]


def test_clarifying_question_names_diagnosis_when_known():
    from app.services.chatbot_service import _clarifying_question

    question = _clarifying_question(
        "en",
        {"crop": "Tomato", "diagnosis": {"disease": "Septoria Leaf Spot"}}
    )

    assert "Septoria Leaf Spot" in question


def test_clarifying_question_is_generic_without_diagnosis():
    from app.services.chatbot_service import (
        CLARIFYING_QUESTIONS,
        _clarifying_question
    )

    question = _clarifying_question("en", {})

    assert question == CLARIFYING_QUESTIONS["en"]

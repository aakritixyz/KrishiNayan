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

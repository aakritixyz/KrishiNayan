import requests

from app.core.config import (
    GROQ_API_KEY,
    GROQ_API_URL,
    GROQ_MODEL
)


def is_available():
    """
    True only when a Groq API key has been configured.
    The chatbot works fully offline without one - this just
    upgrades the answer quality when a key is present.
    """
    return bool(GROQ_API_KEY)


def generate_answer(system_prompt, user_prompt, max_tokens=600):
    """
    Ask the configured Groq Llama model to compose an answer.
    Returns the answer text, or None if no API key is configured
    or the request fails for any reason - callers must fall back
    to a template-based answer in that case.
    """
    if not GROQ_API_KEY:
        return None

    try:
        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "max_tokens": max_tokens,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7
            },
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        answer = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

        return answer or None

    except (requests.RequestException, ValueError, KeyError, IndexError):
        return None

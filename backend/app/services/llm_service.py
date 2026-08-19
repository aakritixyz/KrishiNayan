import requests

from app.core.config import (
    ANTHROPIC_API_KEY,
    ANTHROPIC_API_URL,
    ANTHROPIC_MODEL
)


def is_available():
    """
    True only when an Anthropic API key has been configured.
    The chatbot works fully offline without one - this just
    upgrades the answer quality when a key is present.
    """
    return bool(ANTHROPIC_API_KEY)


def generate_answer(system_prompt, user_prompt, max_tokens=600):
    """
    Ask the configured Anthropic model to compose an answer.
    Returns the answer text, or None if no API key is configured
    or the request fails for any reason - callers must fall back
    to a template-based answer in that case.
    """
    if not ANTHROPIC_API_KEY:
        return None

    try:
        response = requests.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": max_tokens,
                "system": system_prompt,
                "messages": [
                    {"role": "user", "content": user_prompt}
                ]
            },
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        text_blocks = [
            block.get("text", "")
            for block in data.get("content", [])
            if block.get("type") == "text"
        ]

        answer = "\n".join(text_blocks).strip()

        return answer or None

    except (requests.RequestException, ValueError, KeyError):
        return None

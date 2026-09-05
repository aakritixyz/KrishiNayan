import requests

from app.core.config import (
    GROQ_API_KEY,
    GROQ_API_URL,
    GROQ_MODEL,
    SARVAM_API_KEY,
    SARVAM_MODEL
)


def is_available():
    """
    True when at least one LLM provider API key has been configured.
    The chatbot works fully offline without one - this just
    upgrades the answer quality when a key is present.
    """
    return bool(GROQ_API_KEY or SARVAM_API_KEY)


def _try_groq(system_prompt, user_prompt, max_tokens=600):
    """Try Groq API for Llama models."""
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


def _try_sarvam(system_prompt, user_prompt, max_tokens=600):
    """Try Sarvam AI API for Indian language models."""
    if not SARVAM_API_KEY:
        return None

    try:
        from sarvamai import SarvamAI

        client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

        response = client.chat.completions(
            model=SARVAM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            top_p=1,
            max_tokens=max_tokens,
        )

        answer = response.choices[0].message.content.strip()

        return answer or None

    except ImportError:
        # Sarvam package not installed
        return None
    except Exception:
        return None


def generate_answer(system_prompt, user_prompt, max_tokens=600):
    """
    Try multiple LLM providers in order: Sarvam (Indian), then Groq (Llama).
    Returns the answer text, or None if no API key is configured
    or all requests fail - callers must fall back to a template-based
    answer in that case.
    """
    # Try Sarvam first (optimized for Indian languages)
    sarvam_answer = _try_sarvam(system_prompt, user_prompt, max_tokens)
    if sarvam_answer:
        return sarvam_answer

    # Fallback to Groq
    groq_answer = _try_groq(system_prompt, user_prompt, max_tokens)
    if groq_answer:
        return groq_answer

    return None

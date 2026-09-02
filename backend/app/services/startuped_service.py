import logging
import os

import httpx

logger = logging.getLogger(__name__)

STARTUPED_API_URL = "https://www.startuped.ai/api/v1/marketing/signals"


async def send_startuped_signal(
    name: str,
    description: str,
    signal_type: str = "behavioral",
    strength: int = 50,
    value: str = "Medium",
) -> None:
    """
    Send a product-usage signal to Startuped.AI.

    Startuped failures must never break KrishiNayan's core functionality.
    """

    api_key = os.getenv("STARTUPED_API_KEY")

    if not api_key:
        logger.debug("Startuped API key not configured; skipping signal.")
        return

    payload = {
        "name": name,
        "description": description,
        "type": signal_type,
        "strength": strength,
        "value": value,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                STARTUPED_API_URL,
                json=payload,
                headers=headers,
            )

        if response.is_success:
            logger.info("Startuped signal sent: %s", name)
        else:
            logger.warning(
                "Startuped signal failed: %s (%s)",
                name,
                response.status_code,
            )

    except Exception:
        logger.exception("Could not send Startuped signal: %s", name)
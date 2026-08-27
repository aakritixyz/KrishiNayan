import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/voice",
    tags=["voice"],
)


class VoiceSessionResponse(BaseModel):
    session_id: int | str | None = None
    ws_url: str


def _extract_omni_error(response: httpx.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        data = None

    if isinstance(data, dict):
        for key in ("detail", "message", "error"):
            value = data.get(key)

            if isinstance(value, str) and value.strip():
                return value.strip()[:220]

    text = response.text.strip()

    if text:
        return text[:220]

    return f"OmniDimension returned HTTP {response.status_code}"


@router.post("/session")
async def create_voice_session() -> VoiceSessionResponse:
    api_key = os.getenv("OMNIDIM_API_KEY")
    agent_id = os.getenv("OMNIDIM_AGENT_ID")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OMNIDIM_API_KEY is not configured",
        )

    if not agent_id:
        raise HTTPException(
            status_code=500,
            detail="OMNIDIM_AGENT_ID is not configured",
        )

    try:
        parsed_agent_id = int(agent_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail="OMNIDIM_AGENT_ID must be a number",
        ) from exc

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "https://omnidim.io/api/v1/sessions/create",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "agent_id": parsed_agent_id,
                    "type": "voice",
                    "custom_variables": {
                        "app": "KrishiNayan",
                    },
                },
            )

        if response.status_code not in (200, 201):
            omni_error = _extract_omni_error(response)

            print(
                "OmniDimension error:",
                response.status_code,
                omni_error,
            )

            raise HTTPException(
                status_code=502,
                detail=f"Unable to create OmniDimension session: {omni_error}",
            )

        data = response.json()
        ws_url = data.get("ws_url")

        if not ws_url:
            print("OmniDimension response missing ws_url:", data)

            raise HTTPException(
                status_code=502,
                detail="OmniDimension did not return a voice websocket URL",
            )

        return VoiceSessionResponse(
            session_id=data.get("session_id"),
            ws_url=ws_url,
        )

    except HTTPException:
        raise

    except httpx.HTTPError as exc:
        print("OmniDimension connection error:", str(exc))

        raise HTTPException(
            status_code=502,
            detail="Could not reach OmniDimension. Please try again.",
        ) from exc

    except Exception as exc:
        print("Voice session error:", str(exc))

        raise HTTPException(
            status_code=500,
            detail="Voice session could not be created",
        )

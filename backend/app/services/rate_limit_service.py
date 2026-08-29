from collections import defaultdict, deque
import os
from time import time

from fastapi import HTTPException, Request, Response


_REQUESTS = defaultdict(deque)


def rate_limit(limit: int = 30, window_seconds: int = 60):
    async def dependency(request: Request, response: Response):
        if os.getenv("KRISHINAYAN_DISABLE_RATE_LIMIT", "").lower() in {
            "1",
            "true",
            "yes",
        }:
            return

        forwarded = request.headers.get("x-forwarded-for", "")
        client_ip = forwarded.split(",")[0].strip() if forwarded else None
        if not client_ip and request.client:
            client_ip = request.client.host
        key = f"{client_ip or 'unknown'}:{request.url.path}"
        now = time()
        bucket = _REQUESTS[key]
        while bucket and bucket[0] <= now - window_seconds:
            bucket.popleft()
        reset_seconds = (
            max(0, int(window_seconds - (now - bucket[0])))
            if bucket
            else window_seconds
        )
        remaining = max(0, limit - len(bucket) - 1)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_seconds)
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again shortly.",
                headers={
                    "Retry-After": str(reset_seconds),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_seconds),
                },
            )
        bucket.append(now)

    return dependency

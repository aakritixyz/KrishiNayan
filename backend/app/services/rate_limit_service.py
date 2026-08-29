from collections import defaultdict, deque
import os
from time import time

from fastapi import HTTPException, Request


_REQUESTS = defaultdict(deque)


def rate_limit(limit: int = 30, window_seconds: int = 60):
    async def dependency(request: Request):
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
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again shortly.",
            )
        bucket.append(now)

    return dependency

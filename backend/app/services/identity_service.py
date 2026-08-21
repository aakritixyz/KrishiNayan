import uuid

from datetime import datetime, timezone


class MockIdentityVerificationProvider:
    """
    Prototype-only mock identity verification.

    This deliberately does NOT collect, validate, or store any
    Aadhaar number or other government ID - it only simulates a
    provider round trip and returns a verification status plus an
    opaque reference string that is safe to keep.

    To integrate a real, authorized e-KYC provider later (e.g. a
    UIDAI-licensed AUA/KUA aggregator), implement a class with the
    same verify(user_id) signature that calls the provider's API,
    and swap it in via get_identity_provider() below - no other
    part of the app needs to change.
    """

    provider_name = "mock-prototype"

    def verify(self, user_id: int) -> dict:
        reference = f"MOCK-{uuid.uuid4().hex[:10].upper()}"

        return {
            "status": "verified",
            "provider": self.provider_name,
            "reference": reference,
            "verified_at": datetime.now(timezone.utc)
        }


def get_identity_provider():
    """
    Single place to swap the mock provider for a real one later.
    """
    return MockIdentityVerificationProvider()

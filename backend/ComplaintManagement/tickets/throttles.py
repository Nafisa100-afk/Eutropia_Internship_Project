from rest_framework.throttling import AnonRateThrottle


class GuestSubmitThrottle(AnonRateThrottle):
    """Sign up chhara report spam rokhte (rate settings.py te)."""
    scope = "guest_submit"


class GuestTrackThrottle(AnonRateThrottle):
    """Tracking code guess kora kothin korte."""
    scope = "guest_track"

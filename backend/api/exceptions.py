from rest_framework.views import exception_handler
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed, PermissionDenied


FRIENDLY_MESSAGES = {
    NotAuthenticated: "You need to sign in to continue.",
    AuthenticationFailed: "Your session has expired. Please sign in again.",
    PermissionDenied: "You don't have permission to perform this action.",
}


def friendly_exception_handler(exc, context):
    """Replace DRF's terse default detail with a human, action-oriented message."""
    response = exception_handler(exc, context)
    if response is None:
        return response

    for exc_cls, msg in FRIENDLY_MESSAGES.items():
        if isinstance(exc, exc_cls):
            response.data = {
                "detail": msg,
                "code": exc.default_code,
                "status": response.status_code,
            }
            break
    return response

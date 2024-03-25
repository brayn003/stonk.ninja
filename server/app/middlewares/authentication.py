from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.kite import get_kite_session


class AuthenticationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if "/auth" in request.url.path:
            return await call_next(request)

        error_response = JSONResponse(
            status_code=403,
            content={"message": "Unauthorized"},
        )
        if "user" not in request.session:
            return error_response

        kite_session_id = request.session["kite_session_id"]
        kite_session = get_kite_session(kite_session_id)
        if not kite_session:
            return error_response

        request.session["kite_session_id"] = kite_session["sess_id"]
        return await call_next(request)

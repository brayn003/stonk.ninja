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
        if "sess_id" not in request.session:
            return error_response

        sess_id = request.session["sess_id"]
        kite_session = get_kite_session(sess_id)
        if not kite_session:
            return error_response

        request.session["sess_id"] = kite_session["sess_id"]
        return await call_next(request)

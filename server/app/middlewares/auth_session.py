from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.helpers.session import SessionManager


class AuthSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        error_response = JSONResponse(
            status_code=403,
            content={"message": "Unauthorized"},
        )
        session_id = None
        session = None
        if "session_id" in request.session:
            session_id = request.session["session_id"]
            session = SessionManager.get_session(session_id)

        if not session:
            session = SessionManager.create_session()
            session_id = session.id
            request.session["session_id"] = session_id

        if "/auth" in request.url.path or "/session" in request.url.path:
            return await call_next(request)

        if not session.user:
            return error_response

        return await call_next(request)

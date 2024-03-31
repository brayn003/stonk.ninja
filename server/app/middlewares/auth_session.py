from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.helpers.session import SessionManager
from app.services.env import AUTH_TOKEN


class AuthSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Authentication with authorization header
        auth_header = request.headers.get("Authorization")
        auth_token = None
        if auth_header:
            auth_token = auth_header.replace("Bearer ", "")
            if auth_token == AUTH_TOKEN:
                return await call_next(request)

        # Authentication with session cookie
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

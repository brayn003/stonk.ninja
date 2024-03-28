from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.services.session import session_manager


class AuthSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        error_response = JSONResponse(
            status_code=403,
            content={"message": "Unauthorized"},
        )
        session_id, session = None, None
        if "session_id" in request.session:
            session_id = request.session["session_id"]
            session = session_manager.get(session_id)
        else:
            session = session_manager.create()
            request.session["session_id"] = session.id
            session_id = session.id

        if "/auth" in request.url.path or "/session" in request.url.path:
            return await call_next(request)

        if not session.user:
            return error_response

        return await call_next(request)

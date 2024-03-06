from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class ResponseEncoderMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print("This is a middleware!")
        return await call_next(request)

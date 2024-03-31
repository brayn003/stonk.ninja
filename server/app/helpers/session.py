from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field

from app.helpers.models import User
from app.services.cache import cache

_SESSION_CACHE_KEY = "auth:session"


class Session(BaseModel):
    id: str
    user: Optional[User] = Field(default=None)


class SessionManager:
    @staticmethod
    def get_session(session_id: str):
        session_json = cache.get(f"{_SESSION_CACHE_KEY}:{session_id}")
        if not session_json:
            return None
        return Session.model_validate_json(session_json)

    @staticmethod
    def set_session(session_id: str, session: Session):
        return cache.set(f"{_SESSION_CACHE_KEY}:{session_id}", session.model_dump_json())

    @staticmethod
    def delete_session(session_id: str):
        return cache.delete(f"{_SESSION_CACHE_KEY}:{session_id}")

    @staticmethod
    def create_session():
        session_id = str(uuid4())
        session = Session(id=session_id)
        key = f"{_SESSION_CACHE_KEY}:{session_id}"
        cache.set(key, session.model_dump_json(), ex=60 * 60 * 24)
        return session

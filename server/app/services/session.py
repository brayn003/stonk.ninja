from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field

from app.helpers.models import User
from app.services.cache import cache

_SESSION_CACHE_KEY = "app:session"


class Session(BaseModel):
    id: str
    user: Optional[User] = Field(default=None)


class SessionManager:
    def __init__(self):
        self._store = cache

    def get(self, session_id: str):
        session_json = self._store.get(f"{_SESSION_CACHE_KEY}:{session_id}")
        print(session_json)
        if not session_json:
            return None
        return Session.model_validate_json(session_json)

    def set(self, session_id: str, session: Session):
        return self._store.set(
            f"{_SESSION_CACHE_KEY}:{session_id}", session.model_dump_json()
        )

    def delete(self, session_id: str):
        return self._store.delete(f"{_SESSION_CACHE_KEY}:{session_id}")

    def create(self):
        session_id = str(uuid4())
        session = Session(id=session_id)
        key = f"{_SESSION_CACHE_KEY}:{session_id}"
        cache.set(key, session.model_dump_json(), ex=60 * 60 * 24)
        return session


session_manager = SessionManager()

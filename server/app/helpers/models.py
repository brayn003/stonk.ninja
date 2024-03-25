from datetime import datetime, timezone
from typing import Annotated, Optional, TypedDict

from pydantic import BaseModel, BeforeValidator, Field

from app.services.kite import KiteSession

PyObjectId = Annotated[str, BeforeValidator(str)]


class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    full_name: str
    email: str
    password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Session(TypedDict):
    kite_session: KiteSession
    user: User

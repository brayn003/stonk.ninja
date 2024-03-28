# pylint: disable=invalid-name
# pylint: enable=invalid-name
from datetime import datetime, timezone
from typing import Annotated, List, Literal, Optional

from pydantic import BaseModel, BeforeValidator, Field, TypeAdapter

from app.services.db import db

PyObjectId = Annotated[str, BeforeValidator(str)]


class KiteConfiguration(BaseModel):
    api_key: str
    api_secret: str


class Integration(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: Literal["kite"]
    configuration: KiteConfiguration
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntegrationManager:
    @staticmethod
    def create_integration(integration: Integration):
        res = db.integrations.insert_one(integration.model_dump())
        created_integration = db.integrations.find_one({"_id": res.inserted_id})
        return Integration.model_validate(created_integration)

    @staticmethod
    def get_integration(integration_type: str):
        integration = db.integrations.find_one({"type": integration_type})
        return Integration.model_validate(integration)

    @staticmethod
    def list_integrations():
        integrations = db.integrations.find({})
        return TypeAdapter(List[Integration]).validate_python(integrations)

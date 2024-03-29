# pylint: disable=invalid-name
# pylint: enable=invalid-name
from datetime import datetime, timezone
from typing import Annotated, List, Literal, Optional, Union

from pydantic import BaseModel, BeforeValidator, Field, TypeAdapter

from app.services.db import db

PyObjectId = Annotated[str, BeforeValidator(str)]


IntegrationType = Literal["kite"]


class KiteConfiguration(BaseModel):
    integration_type: IntegrationType = "kite"
    api_key: str
    api_secret: str


Configuration = Annotated[Union[KiteConfiguration], Field(discriminator="integration_type")]


class Integration(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: IntegrationType
    configuration: Configuration
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class IntegrationManager:
    @staticmethod
    def set_integration(integration_type: IntegrationType, configuration: Configuration):
        db.integrations.update_one(
            {"type": integration_type}, {"$set": configuration.model_dump()}, upsert=True
        )
        created_integration = db.integrations.find_one({"type": integration_type})
        return Integration.model_validate(created_integration)

    @staticmethod
    def get_integration(integration_type: str):
        integration = db.integrations.find_one({"type": integration_type})
        if not integration:
            return None
        return Integration.model_validate(integration)

    @staticmethod
    def list_integrations():
        integrations = db.integrations.find({})
        return TypeAdapter(List[Integration]).validate_python(integrations)

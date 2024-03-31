# pylint: disable=invalid-name
# pylint: enable=invalid-name
from typing import Annotated, List, Literal, Union

from pydantic import Field, TypeAdapter

from app.helpers.kite import KiteConfiguration, KiteIntegration, load_kiteconnect
from app.services.db import db

IntegrationType = Literal["kite"]


Configuration = Annotated[Union[KiteConfiguration], Field(discriminator="integration_type")]
Integration = Annotated[Union[KiteIntegration], Field(discriminator="type")]


class IntegrationManager:
    @staticmethod
    def set_integration(integration_type: IntegrationType, integration: Integration):
        db.integrations.update_one(
            {"type": integration_type},
            {"$set": integration.model_dump()},
            upsert=True,
        )
        created_integration = db.integrations.find_one({"type": integration_type})
        return TypeAdapter(Integration).validate_python(created_integration)

    @staticmethod
    def get_integration(integration_type: str):
        integration = db.integrations.find_one({"type": integration_type})
        if not integration:
            return None
        return TypeAdapter(Integration).validate_python(integration)

    @staticmethod
    def list_integrations():
        integrations = db.integrations.find({})
        return TypeAdapter(List[Integration]).validate_python(integrations)

    @staticmethod
    def delete_integration(integration_type: IntegrationType):
        db.integrations.delete_one({"type": integration_type})
        return True

    @staticmethod
    async def load_integration(integration: Integration):
        if integration.type == "kite":
            await load_kiteconnect(integration)

    @staticmethod
    async def load_all_integrations():
        integrations = IntegrationManager.list_integrations()
        for integration in integrations:
            if integration.type == "kite":
                await IntegrationManager.load_integration(integration)

# pylint: disable=invalid-name
# pylint: enable=invalid-name
from typing import Annotated, List, Literal, Union

from cryptography.fernet import Fernet
from pydantic import Field, TypeAdapter

from app.helpers.kite import (
    KiteConfiguration,
    KiteIntegration,
    KiteSessionManager,
)
from app.services.db import db
from app.services.env import ENC_KEY

IntegrationType = Literal["kite"]


Configuration = Annotated[Union[KiteConfiguration], Field(discriminator="integration_type")]
Integration = Annotated[Union[KiteIntegration], Field(discriminator="type")]


class _IntegrationSecurity:
    # integration encryption management
    @staticmethod
    def encrypt_configuration(configuration: Configuration):
        fernet = Fernet(ENC_KEY)
        configuration_json = configuration.model_dump_json()
        configuration_enc = fernet.encrypt(bytes(configuration_json, "utf-8"))
        return configuration_enc

    @staticmethod
    def decrypt_configuration(configuration_enc: str):
        fernet = Fernet(ENC_KEY)
        configuration_json = fernet.decrypt(configuration_enc)
        configuration = TypeAdapter(Configuration).validate_json(configuration_json)
        return configuration


class IntegrationManager:
    @staticmethod
    def set_integration(integration_type: IntegrationType, integration: Integration):
        integration_dict = integration.model_dump(exclude={"configuration"})
        configuration_enc = _IntegrationSecurity.encrypt_configuration(integration.configuration)
        integration_dict["configuration"] = configuration_enc
        db.integrations.update_one(
            {"type": integration_type},
            {"$set": integration_dict},
            upsert=True,
        )
        created_integration = IntegrationManager.get_integration(integration_type)
        return created_integration

    @staticmethod
    def get_integration(integration_type: str):
        integration_dict = db.integrations.find_one({"type": integration_type})
        if not integration_dict:
            return None
        configuration = _IntegrationSecurity.decrypt_configuration(
            integration_dict["configuration"]
        )
        integration_dict["configuration"] = configuration
        return TypeAdapter(Integration).validate_python(integration_dict)

    @staticmethod
    def list_integrations():
        integrations_dict = db.integrations.find({})
        for integration_dict in integrations_dict:
            configuration = _IntegrationSecurity.decrypt_configuration(
                integration_dict["configuration"]
            )
            integration_dict["configuration"] = configuration
        return TypeAdapter(List[Integration]).validate_python(integrations_dict)

    @staticmethod
    def delete_integration(integration_type: IntegrationType):
        db.integrations.delete_one({"type": integration_type})
        return True


# integration session management
class IntegrationSessionManager:
    @staticmethod
    async def get_session(integration: Integration, session_name: str = "default"):
        if integration.type == "kite":
            return await KiteSessionManager.get_session(integration, session_name=session_name)

    @staticmethod
    async def load_session(integration: Integration, session_name: str = "default"):
        if integration.type == "kite":
            await KiteSessionManager.load_session(integration, session_name=session_name)

    @staticmethod
    async def load_all_sessions():
        integrations = IntegrationManager.list_integrations()
        for integration in integrations:
            if integration.type == "kite":
                await IntegrationSessionManager.load_session(integration, session_name="default")

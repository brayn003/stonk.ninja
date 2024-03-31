from typing import List

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from app.models.integration import Configuration, Integration, IntegrationManager, IntegrationType

router = APIRouter(prefix="/api")


class ListIntegrationsResponse(BaseModel):
    integrations: List[Integration]


class GetIntegrationResponse(BaseModel):
    integration: Integration


class PatchIntegrationBody(BaseModel):
    configuration: Configuration


class PatchIntegrationResponse(BaseModel):
    integration: Integration


@router.get("/integrations", response_model=ListIntegrationsResponse)
def list_integrations():
    integrations = IntegrationManager.list_integrations()
    return {"integrations": integrations}


@router.get("/integrations/{integration_type}", response_model=GetIntegrationResponse)
def get_integration(integration_type: IntegrationType):
    integration = IntegrationManager.get_integration(integration_type)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    return {"integration": integration}


@router.patch("/integrations/{integration_type}", response_model=PatchIntegrationResponse)
def patch_integration(integration_type: IntegrationType, body: PatchIntegrationBody):
    integration = None
    if integration_type == "kite":
        kite_configuration = Configuration(
            integration_type=integration_type,
            api_key=body.configuration.api_key,
            api_secret=body.configuration.api_secret,
        )
        kite_integration = Integration(type="kite", configuration=kite_configuration)
        integration = IntegrationManager.set_integration(integration_type, kite_integration)

    if not integration:
        raise HTTPException(status_code=400, detail="Not a valid integration type")

    IntegrationManager.load_integration(integration)

    return {"integration": integration}


@router.get("/integrations/{integration_type}/callback", responses={204: {"model": None}})
def integration_callback():
    return Response(status_code=204)

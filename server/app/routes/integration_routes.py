from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.integration import Integration, IntegrationManager, IntegrationType

router = APIRouter(prefix="/api")


class ListIntegrationsResponse(BaseModel):
    integrations: List[Integration]


class GetIntegrationResponse(BaseModel):
    integration: Integration


class UpdateIntegrationResponse(BaseModel):
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


@router.patch("/integrations/{integration_type}", response_model=UpdateIntegrationResponse)
def create_integration(integration_type: IntegrationType, body: Integration):
    integration = IntegrationManager.set_integration(integration_type, body)
    return {"integration": integration}

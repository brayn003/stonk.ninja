from typing import List

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.integration import Integration, IntegrationManager

router = APIRouter(prefix="/api")


class ListIntegrationsResponse(BaseModel):
    integrations: List[Integration]


class CreateIntegrationResponse(BaseModel):
    integration: Integration


@router.get("/integrations", response_model=ListIntegrationsResponse)
def list_integrations():
    integrations = IntegrationManager.list_integrations()
    return {"integrations": integrations}


@router.post("/integrations", response_model=CreateIntegrationResponse)
def create_integration(body: Integration):
    integration = IntegrationManager.create_integration(body)
    return {"integration": integration}

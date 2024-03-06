from fastapi import APIRouter
from pydantic import BaseModel

from app.services.kite import KiteSession, create_kite_session, kite_login_url


class LoginResponse(BaseModel):
    login_url: str


class LoginCallbackBody(BaseModel):
    request_token: str


class LoginCallbackResponse(BaseModel):
    session: KiteSession


router = APIRouter()
router.prefix = "/api/auth"


@router.post("/login", response_model=LoginResponse)
async def login():
    login_url = kite_login_url()
    return {"login_url": login_url}


@router.post("/login/callback", response_model=LoginCallbackResponse)
async def login_callback(body: LoginCallbackBody):
    session = create_kite_session(body.request_token)
    return {"session": session}

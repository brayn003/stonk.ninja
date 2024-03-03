from fastapi import APIRouter
from app.services.kite import kite
from app.services.env import KITE_API_SECRET
from pydantic import BaseModel

class LoginCallbackBody(BaseModel):
    request_token: str

router = APIRouter()
router.prefix = "/api/auth"



@router.post("/login")
async def login():
    login_url = kite.login_url()
    return { 'login_url': login_url }

@router.post("/login/callback")
async def login_callback(body: LoginCallbackBody):
    data = kite.generate_session(body.request_token, api_secret=KITE_API_SECRET)
    return data

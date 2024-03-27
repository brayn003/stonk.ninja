import bcrypt
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.errors import (
    InvalidEmailException,
    UserAlreadyExistsException,
)
from app.helpers.models import User
from app.helpers.validators import is_valid_email, is_valid_password
from app.services.db import db
from app.services.kite import KiteSession
from app.services.session import Session, session_manager


class LoginCallbackBody(BaseModel):
    request_token: str


class LoginCallbackResponse(BaseModel):
    kite_session: KiteSession


class SignupBody(BaseModel):
    full_name: str
    email: str
    password: str


class SignupResponse(BaseModel):
    user: User


class LoginBody(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    session: Session


router = APIRouter(prefix="/api/auth")


@router.post("/signup", response_model=SignupResponse, response_model_by_alias=False)
async def signup(body: SignupBody):
    if not is_valid_email(body.email):
        raise HTTPException(status_code=400, detail="Email is invalid")
    if not is_valid_password(body.password):
        raise HTTPException(status_code=400, detail="Password is weak")
    existing_user = db.users.find_one(
        {"email": body.email}, projection={"_id": 0, "email": 1}
    )
    exists = bool(existing_user)
    if exists:
        raise UserAlreadyExistsException("User already exists")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(bytes(body.password, encoding="utf-8"), salt)
    user_body = User(
        full_name=body.full_name,
        email=body.email,
        password=hashed,
    )
    res = db.users.insert_one(user_body.model_dump())
    user = db.users.find_one({"_id": res.inserted_id})
    user = User.model_validate(user)
    del user.password
    return {"user": user}


@router.post("/login", response_model=LoginResponse, response_model_by_alias=False)
async def login(request: Request, body: LoginBody):
    if not is_valid_email(body.email):
        raise InvalidEmailException("Email is invalid")
    user = db.users.find_one({"email": body.email})
    user = User.model_validate(user)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    match = bcrypt.checkpw(
        bytes(body.password, encoding="utf-8"), bytes(user.password, encoding="utf-8")
    )
    if not match:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # create session
    session_id = request.session["session_id"]
    session = session_manager.get(session_id)
    session.user = user
    session_manager.set(session.id, session)
    return {"session": session}


# @router.post("/login/callback", response_model=LoginCallbackResponse)
# async def login_callback(body: LoginCallbackBody, request: Request):
#     kite_session = create_kite_session(body.request_token)
#     request.session["kite_session_id"] = kite_session["sess_id"]
#     return {"kite_session": kite_session}

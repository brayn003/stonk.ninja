from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.errors import (
    InvalidEmailException,
)
from app.helpers.auth import compare_passwords, hash_password
from app.helpers.models import User, UserInDB
from app.helpers.session import Session, SessionManager
from app.helpers.validators import is_valid_email, is_valid_password
from app.services.db import db


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
    existing_user = db.users.find_one({"email": body.email}, projection={"_id": 0, "email": 1})
    exists = bool(existing_user)
    if exists:
        raise HTTPException(status_code=409, detail="User already exists")
    user_body = UserInDB(
        full_name=body.full_name,
        email=body.email,
        password=hash_password(body.password),
    )
    res = db.users.insert_one(user_body.model_dump())
    user = db.users.find_one({"_id": res.inserted_id})
    user = User.model_validate(user)
    return {"user": user}


@router.post("/login", response_model=LoginResponse, response_model_by_alias=False)
async def login(request: Request, body: LoginBody):
    if not is_valid_email(body.email):
        raise InvalidEmailException("Email is invalid")
    user = db.users.find_one({"email": body.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = UserInDB.model_validate(user)
    match = compare_passwords(body.password, user.password)
    if not match:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # create session
    session_id = request.session["session_id"]
    session = SessionManager.get_session(session_id)
    session.user = User.model_validate(user.model_dump())
    SessionManager.set_session(session.id, session)
    return {"session": session}

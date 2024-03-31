from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.helpers.session import Session, SessionManager

router = APIRouter(prefix="/api")


class SessionResponse(BaseModel):
    session: Session


@router.get("/session", response_model=SessionResponse)
def get_session(request: Request):
    session_id = request.session["session_id"]
    session = SessionManager.get_session(session_id)
    return {"session": session}

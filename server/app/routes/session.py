from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.services.session import Session, session_manager

router = APIRouter(prefix="/api/session")


class SessionResponse(BaseModel):
    session: Session


@router.get("/", response_model=SessionResponse)
def get_session(request: Request):
    session_id = request.session["session_id"]
    session = session_manager.get(session_id)
    return {"session": session}

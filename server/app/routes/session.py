from fastapi import APIRouter, Request

from app.services.kite import delete_kite_session, get_kite_session

router = APIRouter()
router.prefix = "/api/session"


@router.get("/")
async def route_get_session(request: Request):
    sess_id = request.session["sess_id"]
    session = get_kite_session(sess_id)
    return {session}


@router.delete("/")
async def login_callback(request: Request):
    delete_kite_session(request.session["sess_id"])
    return {"session": None}

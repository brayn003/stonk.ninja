import subprocess
from datetime import datetime

from fastapi import APIRouter, Request

from app.services.db import db
from app.services.kite import get_kite_session

router = APIRouter(prefix="/api/ticks")

log_file = open("logs/app_scripts/capture_ticks.log", "w", encoding="utf-8")


@router.post("/capture/start")
async def route_ticks_capture_start(request: Request):
    kite_session_id = request.session["kite_session_id"]
    kite_session = get_kite_session(kite_session_id)
    args = [
        ".venv/bin/python",
        "app_scripts/capture_ticks.py",
        kite_session["data"]["access_token"],
    ]
    print(args)
    process = subprocess.Popen(
        args,
        stdout=log_file,
        stderr=subprocess.STDOUT,
    )
    capture_tick_process_doc = {
        "kite_session_id": kite_session_id,
        "process_id": process.pid,
        "is_running": True,
        "started_at": datetime.now(),
        "created_at": datetime.now(),
        "error": None,
        "completed_at": None,
    }
    db["capture_tick_processes"].insert_one(capture_tick_process_doc)

    return {"started": True}

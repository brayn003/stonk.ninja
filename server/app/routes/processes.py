import json
import subprocess

from fastapi import APIRouter

router = APIRouter(prefix="/api/processes")


@router.get("/")
async def login():
    try:
        res = subprocess.run(
            ["pm2", "jlist"], capture_output=True, text=True, check=True
        )
        processes = json.loads(res.stdout)
        return {"processes": processes}
    except subprocess.CalledProcessError as e:
        print(e.stderr)
        return {"processes": False}

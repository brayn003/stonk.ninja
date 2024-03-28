from fastapi import APIRouter

router = APIRouter(prefix="/api/ticks")


@router.get("/")
def list_ticks():
    return {"message": "Hello, ticks!"}

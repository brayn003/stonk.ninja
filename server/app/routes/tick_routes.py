from fastapi import APIRouter
from pydantic import BaseModel

from app.models.tick import Tick, TickManager

router = APIRouter(prefix="/api")


class ListTickseResponse(BaseModel):
    ticks: list[Tick]


@router.get("/ticks/{tradingsymbol}", response_model=ListTickseResponse)
def list_ticks(tradingsymbol: str):
    ticks = TickManager.list_ticks(tradingsymbol=tradingsymbol)
    return {"ticks": ticks}

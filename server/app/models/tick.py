from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, TypeAdapter

from app.helpers.types import PyObjectId
from app.services.db import db


class KiteTickDepthLevel(BaseModel):
    quantity: int
    price: float
    orders: int


class KiteTickDepth(BaseModel):
    buy: List[KiteTickDepthLevel]
    sell: List[KiteTickDepthLevel]


class KiteTickOhlc(BaseModel):
    open: float
    high: float
    low: float
    close: float


class KiteTick(BaseModel):
    tradable: bool
    mode: Literal["full", "ltp", "quote"]
    instrument_token: int
    last_price: float
    last_traded_quantity: int
    average_traded_price: float
    volume_traded: int
    total_buy_quantity: int
    total_sell_quantity: int
    ohlc: KiteTickOhlc
    change: float
    last_trade_time: datetime
    oi: int
    oi_day_high: int
    oi_day_low: int
    exchange_timestamp: datetime
    depth: KiteTickDepth


class TickMetadata(BaseModel):
    instrument_token: int
    tradingsymbol: str


class Tick(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    timestamp: datetime
    metadata: TickMetadata
    data: KiteTick
    received_at: datetime


class TickManager:
    @staticmethod
    def list_ticks(tradingsymbol: str, from_date: datetime = None, to_date: datetime = None):
        ticks = (
            db.ticks.find(
                {
                    "received_at": {"$gte": datetime(2021, 1, 1)},
                    "metadata.tradingsymbol": tradingsymbol,
                }
            )
            .sort("received_at", 1)
            .limit(5000)
        )
        ticks = TypeAdapter(List[Tick]).validate_python(ticks)

        return ticks

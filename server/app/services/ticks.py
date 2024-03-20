from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel


class TickDepthLevel(BaseModel):
    quantity: int
    price: float
    orders: int


class TickDepth(BaseModel):
    buy: List[TickDepthLevel]
    sell: List[TickDepthLevel]


class TickOhlc(BaseModel):
    open: float
    high: float
    low: float
    close: float


class Tick(BaseModel):
    tradable: bool
    mode: Literal["full", "ltp", "quote"]
    instrument_token: int
    last_price: float
    last_traded_quantity: int
    average_traded_price: float
    volume_traded: int
    total_buy_quantity: int
    total_sell_quantity: int
    change: float
    last_trade_time: datetime
    oi: int
    oi_day_high: int
    oi_day_low: int
    exchange_timestamp: datetime
    depth: TickDepth


class TicksMessage(BaseModel):
    vendor: Literal["kite"]
    ticks: List[Tick]


class TickDocMetadata(BaseModel):
    instrument_token: int
    tradingsymbol: str


class TickDoc(BaseModel):
    _id: str
    timestamp: datetime
    metadata: TickDocMetadata
    data: Tick
    received_at: datetime

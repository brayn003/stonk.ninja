from datetime import datetime
from typing import List, Literal

import pika
from pydantic import BaseModel

from app.services.env import RABBITMQ_URI


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


class TicksBroadcast:
    def __init__(self):
        connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URI))
        channel = connection.channel()
        channel.exchange_declare(exchange="ticks", exchange_type="fanout")
        result = channel.queue_declare(queue="", exclusive=True)
        self.queue = result.method.queue
        self.channel = channel

    def publish(self, ticks: List[Tick]):
        message: str = TicksMessage(vendor="kite", ticks=ticks).model_dump_json()
        self.channel.basic_publish(exchange="ticks", routing_key="", body=message)

    def subscribe(self, callback):
        self.channel.queue_bind(exchange="ticks", queue=self.queue)
        self.channel.basic_consume(
            queue=self.queue, on_message_callback=callback, auto_ack=True
        )
        self.channel.start_consuming()

    def unsubscribe(self):
        self.channel.stop_consuming()
        self.channel.queue_unbind(exchange="ticks", queue=self.queue)


ticks_broadcast = TicksBroadcast()

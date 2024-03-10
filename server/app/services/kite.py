from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from fastapi import HTTPException
from kiteconnect import KiteConnect
from kiteconnect.exceptions import TokenException
from pydantic import BaseModel, EmailStr, HttpUrl

from app.services.db import db
from app.services.env import KITE_API_KEY, KITE_API_SECRET
from app.services.store import Store

kite_session_cache = Store("app:session")
kite = KiteConnect(api_key=KITE_API_KEY)


class KiteNativeSession(BaseModel):
    user_type: str
    email: EmailStr
    user_name: str
    user_shortname: str
    broker: str
    exchanges: List[str]
    products: List[str]
    order_types: List[str]
    avatar_url: HttpUrl | None
    user_id: str
    api_key: str
    access_token: str
    public_token: str
    enctoken: str
    login_time: datetime
    meta: Dict[str, str]


class KiteSession(BaseModel):
    _id: str  # Optional[ObjectId]
    sess_id: str
    type: str
    data: KiteNativeSession
    is_active: bool
    created_at: datetime


def kite_login_url():
    return kite.login_url()


def get_kite_session(sess_id: str) -> Optional[KiteSession] | None:
    kite_session = kite_session_cache.get_item(sess_id)
    if not kite_session:
        kite_session = db["sessions"].find_one(
            {"sess_id": sess_id, "type": "app/kite", "is_active": True}
        )
    if not kite_session:
        return None
    return kite_session


def delete_kite_session(sess_id: str) -> bool:
    kite_session = get_kite_session(sess_id)
    kite.invalidate_access_token(kite_session["data"]["access_token"])
    db["sessions"].update_one({"sess_id": sess_id}, {"$set": {"is_active": False}})
    kite_session_cache.delete_item(sess_id)
    return True


def create_kite_session(request_token: str) -> KiteSession:
    sess_id = str(uuid4())
    try:
        data = kite.generate_session(request_token, api_secret=KITE_API_SECRET)
    except TokenException as e:
        raise HTTPException(status_code=401, detail=str(e)) from e

    kite.set_session_expiry_hook(lambda: delete_kite_session(sess_id))
    db["sessions"].update_many(
        {"data.email": data["email"], "type": "app/kite", "is_active": True},
        {"$set": {"is_active": False}},
    )
    db["sessions"].insert_one(
        {
            "sess_id": sess_id,
            "type": "app/kite",
            "data": data,
            "is_active": True,
            "created_at": datetime.now(),
        }
    )
    kite_session = db["sessions"].find_one({"sess_id": sess_id})
    kite_session_cache.set_item(sess_id, kite_session)
    return kite_session

    # def record_ticks(self, ws, ticks, count=0):
    # processed_ticks = []
    # for tick in ticks:
    #     if tick["mode"] != ws.MODE_FULL:
    #         continue
    #     count += 1
    #     exchange_timestamp = tick["exchange_timestamp"]
    #     instrument_token = tick["instrument_token"]
    #     tradingsymbol = Instrument(instrument_token).name
    #     processed_tick = {
    #         "timestamp": exchange_timestamp,
    #         "metadata": {
    #             "instrument_token": instrument_token,
    #             "tradingsymbol": tradingsymbol,
    #         },
    #         "data": tick,
    #         "received_timestamp": datetime.now(),
    #     }
    #     processed_ticks.append(processed_tick)
    # self.ticks_col.insert_many(processed_ticks)
    # return processed_ticks, count

    # pylint: disable=unused-argument

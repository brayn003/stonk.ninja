#!python


from typing import List

import pymongo
from kiteconnect import KiteTicker
from pydantic import TypeAdapter

from app.constants import WatchedInstrument
from app.services.db import db
from app.services.env import KITE_API_KEY
from app.services.ticks import Tick, ticks_broadcast


class KiteTickProcessor:
    def __init__(self):
        self.ticks_batch = 0
        latest_session = db["sessions"].find_one(
            {"is_active": True}, sort=[("_id", pymongo.DESCENDING)]
        )
        access_token = latest_session["data"]["access_token"]
        self.kws = KiteTicker(KITE_API_KEY, access_token=access_token)
        self.kws.on_ticks = self.on_ticks
        self.kws.on_connect = self.on_connect
        self.kws.on_close = self.on_close

    # pylint: disable-next=unused-argument
    def on_ticks(self, ws, raw_ticks):
        ta = TypeAdapter(List[Tick])
        ticks = ta.validate_python(raw_ticks)
        ticks_broadcast.publish(ticks)
        self.ticks_batch += 1
        ticks_def = list(
            map(
                lambda tick: {
                    WatchedInstrument(tick.instrument_token).name: tick.last_price
                },
                ticks,
            )
        )
        print(
            f"[Published] BATCH:{self.ticks_batch} TOTAL: {len(ticks)} TICKS: {ticks_def}"
        )

    # pylint: disable-next=unused-argument
    def on_connect(self, ws, response):
        all_instruments = [e.value for e in WatchedInstrument]
        ws.subscribe(all_instruments)
        ws.set_mode(ws.MODE_FULL, all_instruments)
        print("[Connected] SUBSCRIBED: ", all_instruments)

    # pylint: disable-next=unused-argument
    def on_close(self, ws, code, reason):
        print("[Closed] CODE: ", code, "REASON: ", reason)


if __name__ == "__main__":
    try:
        ktp = KiteTickProcessor()
        ktp.kws.connect()
    except KeyboardInterrupt:
        print("[Stopped]")

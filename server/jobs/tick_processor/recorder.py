from datetime import datetime

from app.constants import WatchedInstrument
from app.services.db import db
from app.services.ticks import TickDoc, TicksMessage, ticks_broadcast


class TicksRecorder:
    def __init__(self):
        self.ticks_col = db["ticks"]
        self.count = 0
        self.batch = 0

    def ticks_subscribe_cb(self, ch, method, properties, body):
        ticks_message = TicksMessage.model_validate_json(body)
        ticks = ticks_message.ticks
        self.batch += 1
        print(f"[Received] BATCH: {self.batch} COUNT: {len(ticks)}")
        self.record_ticks(ticks)
        print(f"[Recorded] BATCH: {self.batch} COUNT: {len(ticks)} TOTAL: {self.count}")

    def record_ticks(self, ticks):
        processed_ticks = []
        for tick in ticks:
            self.count += 1
            exchange_timestamp = tick.exchange_timestamp
            instrument_token = tick.instrument_token
            tradingsymbol = WatchedInstrument(instrument_token).name

            processed_tick = TickDoc(
                timestamp=exchange_timestamp,
                metadata={
                    "instrument_token": instrument_token,
                    "tradingsymbol": tradingsymbol,
                },
                data=tick,
                received_at=datetime.now(),
            )
            processed_ticks.append(processed_tick.model_dump())
            tick_def = {
                processed_tick.metadata.tradingsymbol: processed_tick.data.last_price
            }
            print(f"[Processed] COUNT: {self.count} DEF: {tick_def}")
        self.ticks_col.insert_many(processed_ticks)

    def listen(self):
        print("[Listening]")
        ticks_broadcast.subscribe(self.ticks_subscribe_cb)


if __name__ == "__main__":
    try:
        tr = TicksRecorder()
        tr.listen()
    except KeyboardInterrupt:
        ticks_broadcast.unsubscribe()
        print("[Stopped]")

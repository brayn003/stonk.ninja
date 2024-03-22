import { Broadcast } from "../services/broadcast";
import { db } from "../services/db";
import { WatchedInstruments } from "../services/instruments";
import type { Tick, TickMessage } from "../types";

class KiteTickerRecorder {
  count: number = 0;
  batchId: number = 0;

  async #record(ticks: Tick[]) {
    const processedTicks = [];
    for (const tick of ticks) {
      const pTick = {
        timestamp: new Date(tick.exchange_timestamp),
        metadata: {
          instrument_token: tick.instrument_token,
          tradingsymbol: WatchedInstruments[tick.instrument_token],
        },
        data: {
          ...tick,
          exchange_timestamp: new Date(tick.exchange_timestamp),
          last_trade_time: new Date(tick.last_trade_time),
        },
        received_at: new Date(),
      };
      processedTicks.push(pTick);
      this.count += 1;
      // logging
      const tickDef = JSON.stringify({ [pTick.metadata.tradingsymbol]: pTick.data.last_price });
      console.log(`[Processed] COUNT: ${this.count} TICK: ${tickDef}`);
    }
    await db.collection("ticks").insertMany(processedTicks);
  }

  async #subscribeCb(msg: TickMessage) {
    const { ticks } = msg;
    this.batchId += 1;
    console.log(`[Received] BATCH: ${this.batchId} COUNT: ${ticks.length}`);
    await this.#record(ticks);
    console.log(`[Recorded] BATCH: ${this.batchId} COUNT: ${ticks.length} TOTAL: ${this.count}`);
  }

  async listen() {
    const broadcast = new Broadcast();
    await broadcast.connectConsumer();
    await broadcast.subscribe(this.#subscribeCb.bind(this));
    console.log("[Listening]");
  }
}

export async function runRecorder() {
  const recorder = new KiteTickerRecorder();
  await recorder.listen();
}

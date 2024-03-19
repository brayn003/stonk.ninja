import { KiteTicker } from "kiteconnect";

import { Broadcast } from "../services/broadcast";
import { db } from "../services/db";
import { WatchedInstruments } from "../services/instruments";
import type { Tick } from "../types";

interface SessionDoc {
  sess_id: string;
  type: "app/kite";
  data: {
    api_key: string;
    access_token: string;
  };
}

class KiteTickerEmitter {
  ticker?: KiteTicker;
  broadcast?: Broadcast;
  batchId: number = 0;

  async initialize() {
    const sessionDoc = await db.collection<SessionDoc>("sessions").findOne({ is_active: true }, { sort: { _id: -1 } });
    if (!sessionDoc) throw new Error("No active session found");
    this.ticker = new KiteTicker({
      api_key: sessionDoc.data.api_key,
      access_token: sessionDoc.data.access_token,
      // does not obey the max_retry and max_delay options
      reconnect: true,
      max_retry: 5,
      max_delay: 5,
    });

    this.ticker.on("ticks", this.#onTicks.bind(this));
    this.ticker.on("connect", this.#onConnect.bind(this));
    this.ticker.on("disconnect", this.#onClose.bind(this));

    const broadcast = new Broadcast();
    await broadcast.connectProducer();
    this.broadcast = broadcast;
  }

  async #onTicks(ticks: Tick[]) {
    if (!this.broadcast) throw new Error("Broadcast not initialized");
    await this.broadcast.publish(ticks);
    this.batchId += 1;

    const ticksDef = ticks.map((tick) => ({
      [WatchedInstruments[tick.instrument_token]]: tick.last_price,
    }));
    console.log(`[Published] BATCH: ${this.batchId} TOTAL: ${ticks.length} TICKS: ${JSON.stringify(ticksDef)}`);
  }

  async #onConnect() {
    if (!this.ticker) throw new Error("Ticker not initialized");
    const instruments = Object.keys(WatchedInstruments).map(
      (key) => WatchedInstruments[key as keyof typeof WatchedInstruments],
    );
    this.ticker.subscribe(instruments);
    this.ticker.setMode(this.ticker.modeFull, instruments);
    console.log(`[Connected] SUBSCRIBED: ${JSON.stringify(instruments)}`);
  }

  async #onClose(ws: { code: number; reason: string }) {
    if (!this.ticker) throw new Error("Ticker not initialized");
    this.ticker.disconnect();
    console.log(`[Closed] CODE: ${ws?.code} REASON: ${ws?.reason}`);
  }

  start() {
    if (!this.ticker) throw new Error("Ticker not initialized");
    this.ticker.connect();
  }
}

async function main() {
  const emitter = new KiteTickerEmitter();
  await emitter.initialize();
  emitter.start();
}

main();

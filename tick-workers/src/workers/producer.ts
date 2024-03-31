import { KiteTicker } from "kiteconnect";

import { Broadcast } from "../services/broadcast";
import { WatchedInstruments } from "../services/instruments";
import { initialiseKiteSession } from "../services/kite-session";
import type { Tick } from "../types";

class KiteTickerProducer {
  ticker?: KiteTicker;
  broadcast?: Broadcast;
  batchId: number = 0;
  isReconnecting: boolean = false;

  async initialize() {
    const kiteSession = await initialiseKiteSession();
    if (!kiteSession || !kiteSession?.is_active) {
      throw new Error("No active session found");
    }
    console.log(`[Connected] KITE`);
    this.ticker = new KiteTicker({
      api_key: kiteSession.data.api_key,
      access_token: kiteSession.data.access_token,
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
    if (!this.isReconnecting) {
      this.isReconnecting = true;
      await initialiseKiteSession();
      this.isReconnecting = false;
    }
    console.log(`[Closed] CODE: ${ws?.code} REASON: ${ws?.reason}`);
  }

  start() {
    if (!this.ticker) throw new Error("Ticker not initialized");
    this.ticker.connect();
  }
}

export async function runProducer() {
  const producer = new KiteTickerProducer();
  await producer.initialize();
  producer.start();
}

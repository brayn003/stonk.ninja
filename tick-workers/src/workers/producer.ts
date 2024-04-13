import { KiteTicker } from "kiteconnect";

import { Broadcast } from "../services/broadcast";
import { WatchedInstruments } from "../services/instruments";
import { getKiteSession, initialiseKiteSession, loadKiteSession } from "../services/kite-session";
import type { Tick } from "../types";

class KiteTickerProducer {
  ticker?: KiteTicker;
  broadcast?: Broadcast;
  batchId: number = 0;

  async initialize() {
    const kiteSession = await initialiseKiteSession();
    console.log("seems fine");
    if (!kiteSession || !kiteSession?.is_active) {
      throw new Error("No active session found");
    }
    console.log(`[Connected] KITE`);
    this.ticker = new KiteTicker({
      api_key: kiteSession.data.api_key,
      access_token: kiteSession.data.access_token,
      // does not obey the max_retry and max_delay options
      // reconnect: false,
      // max_retry: 5,
      // max_delay: 5,
    });

    this.ticker.autoReconnect(true, 3, 5);

    this.ticker.on("ticks", this.#onTicks);
    this.ticker.on("connect", this.#onConnect);
    this.ticker.on("disconnect", this.#onDisconnect);
    this.ticker.on("noreconnect", this.#onNoReconnect);

    const broadcast = new Broadcast();
    await broadcast.connectProducer();
    this.broadcast = broadcast;
  }

  readonly #onTicks = async (ticks: Tick[]) => {
    if (!this.broadcast) throw new Error("Broadcast not initialized");
    await this.broadcast.publish(ticks);
    this.batchId += 1;

    const ticksDef = ticks.map((tick) => ({
      [WatchedInstruments[tick.instrument_token]]: tick.last_price,
    }));
    console.log(`[Published] BATCH: ${this.batchId} TOTAL: ${ticks.length} TICKS: ${JSON.stringify(ticksDef)}`);
  };

  readonly #onConnect = async () => {
    if (!this.ticker) throw new Error("Ticker not initialized");
    const instruments = Object.keys(WatchedInstruments).map(
      (key) => WatchedInstruments[key as keyof typeof WatchedInstruments],
    );
    this.ticker.subscribe(instruments);
    this.ticker.setMode(this.ticker.modeFull, instruments);
    console.log(`[Connected] SUBSCRIBED: ${JSON.stringify(instruments)}`);
  };

  readonly #onDisconnect = async (ws: { code: number; reason: string }) => {
    if (!this.ticker) throw new Error("Ticker not initialized");
    console.log(`[Disconnected] CODE: ${ws?.code} REASON: ${ws?.reason}`);
  };

  readonly #onNoReconnect = async () => {
    console.log(`[NoReconnect] KITE`);
    await this.initialize();
    console.log("thid is new");
    this.start();
  };

  async start() {
    if (!this.ticker) throw new Error("Ticker not initialized");
    this.ticker.connect();
  }
}

export async function runProducer() {
  const producer = new KiteTickerProducer();
  await producer.initialize();
  producer.start();
  console.log("damama");
}

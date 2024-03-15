import type { ConsumeMessage } from "amqplib";

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
        timestamp: tick.exchange_timestamp,
        metadata: {
          instrument_token: tick.instrument_token,
          tradingsymbol: WatchedInstruments[tick.instrument_token],
        },
        data: tick,
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

  async #subscribeCb(msg: ConsumeMessage | null) {
    if (msg?.content) {
      const { ticks }: TickMessage = JSON.parse(msg.content.toString());
      this.batchId += 1;
      console.log(`[Received] BATCH: ${this.batchId} COUNT: ${ticks.length}`);
      await this.#record(ticks);
      console.log(`[Recorded] BATCH: ${this.batchId} COUNT: ${ticks.length} TOTAL: ${this.count}`);
    }
  }

  async listen() {
    const broadcast = new Broadcast();
    await broadcast.initialize();
    await broadcast.subscribe(this.#subscribeCb.bind(this));
    console.log("[Listening]");
  }
}

async function main() {
  const recorder = new KiteTickerRecorder();
  await recorder.listen();
}

main();

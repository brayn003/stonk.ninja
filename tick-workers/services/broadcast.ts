import type { Channel, ConsumeMessage, Replies } from "amqplib";
import amqplib from "amqplib";

import { ENV_RABBITMQ_URI } from "../services/env";
import type { Tick } from "../types";

export class Broadcast {
  readonly #exchange: string = "ticks";
  channel?: Channel;

  async initialize() {
    const conn = await amqplib.connect(ENV_RABBITMQ_URI);
    const channel = await conn.createChannel();
    await channel.assertExchange(this.#exchange, "fanout", { durable: false });
    this.channel = channel;
  }

  async publish(ticks: Tick[]) {
    if (!this.channel) throw new Error("Channel not initialized");
    const msg = JSON.stringify({ vendor: "kite", ticks });
    this.channel.publish(this.#exchange, "", Buffer.from(msg));
  }

  async subscribe(cb: (msg: ConsumeMessage | null) => void) {
    if (!this.channel) throw new Error("Channel not initialized");
    const q = await this.channel.assertQueue("", { exclusive: true });
    await this.channel.bindQueue(q.queue, this.#exchange, "");
    this.channel.consume(q.queue, cb, { noAck: true });
    return q;
  }

  async unsubscribe(q: Replies.AssertQueue) {
    if (!this.channel) throw new Error("Channel not initialized");
    this.channel.unbindQueue(q.queue, this.#exchange, "");
    this.channel.deleteQueue(q.queue);
  }

  async close() {
    if (!this.channel) throw new Error("Channel not initialized");
    await this.channel.close();
  }
}

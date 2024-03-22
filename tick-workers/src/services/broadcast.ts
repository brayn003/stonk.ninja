import type { Consumer, Producer } from "kafkajs";
import { Kafka } from "kafkajs";

import type { Tick, TickMessage } from "../types";
import { ENV_KAFKA_URI } from "./env";

export class Broadcast {
  readonly #topic: string = "ticks";
  kafka?: Kafka;
  producer?: Producer;
  consumer?: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: "client-1",
      brokers: [ENV_KAFKA_URI],
    });
  }

  async connectProducer() {
    if (!this.kafka) throw new Error("Kafka not initialized");
    const producer = this.kafka.producer();
    await producer.connect();
    this.producer = producer;
  }

  async disconnectProducer() {
    if (!this.producer) throw new Error("Producer not initialized");
    await this.producer.disconnect();
  }

  async publish(ticks: Tick[]) {
    if (!this.producer) throw new Error("Producer not initialized");
    const msg = { vendor: "kite", ticks };
    this.producer.send({
      topic: this.#topic,
      messages: [{ value: JSON.stringify(msg) }],
    });
  }

  async connectConsumer() {
    if (!this.kafka) throw new Error("Kafka not initialized");
    const consumer = this.kafka.consumer({ groupId: "tick-recorder" });
    await consumer.connect();
    await consumer.subscribe({ topic: this.#topic });
    this.consumer = consumer;
  }

  async disconnectConsumer() {
    if (!this.consumer) throw new Error("Consumer not initialized");
    await this.consumer.disconnect();
  }

  async subscribe(cb: (msg: TickMessage) => void) {
    return await this.consumer?.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          console.log("No message value");
          return;
        }
        const msg: TickMessage = JSON.parse(message.value.toString());
        cb(msg);
      },
    });
  }
}

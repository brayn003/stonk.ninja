import { runProducer } from "./workers/producer";
import { runRecorder } from "./workers/recorder";

async function main() {
  const worker = process.argv[2];
  switch (worker) {
    case "producer": {
      await runProducer();
      return;
    }
    case "recorder": {
      await runRecorder();
      return;
    }
    default:
      throw new Error(`Unknown worker: ${worker}`);
  }
}

main();

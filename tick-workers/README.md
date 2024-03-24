# stonk.ninja tick-workers
`stonk.ninja tick-workers` are a collection of programs that manage tick-data in realtime.

## Technology 💻
`stonk.ninja tick-workers` is a TypeScript project that runs on the Node.js environment. It uses Kafka to handle real-time market tick data at scale and relies on Kite Developer APIs to provide the tick data.


## Worker Types ✨
- **Producer**: Collects data from Kite broker and publishes it to Kafka memory bus
- **Recorder**: Records tick data from Kafka memory bus


## Getting Started 🚀

### Prerequisites
Before getting started, make sure you have the following prerequisites installed:

1. Node.js >= 18.19.0: You can download and install Node.js from the official website [here](https://nodejs.org/en/download).
2. Pnpm >= 8.15.5: Pnpm is used to manage dependencies in the project. You can install it by following the instructions in the official documentation [here](https://pnpm.io/installation).
3. Kafka >= 3.7.0: Kafka is needed for this project. You can follow the instructions [here](https://kafka.apache.org/quickstart) to install it.

### Installation
1. Clone the repository
```bash
git clone https://github.com/brayn003/stonk.ninja.git
```
2. Navigate to the project directory
```bash
cd tick-workers
```
3. Install dependencies with pnpm
```bash
pnpm install
```
4. Create the `.env` file. Please replace the values depending on your project environment
```bash
cp .env.example .env
```

### Run Locally
To run `stonk.ninja tick-worker` locally, run the following command:
```bash
pnpm run dev [worker-type]
```
`worker-type` can either be a `producer` or a `recorder`.


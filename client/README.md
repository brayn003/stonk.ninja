# stonk.ninja client
`stonk.ninja client` is a robust and dynamic visualization tool for market data analysis. It is built on top of `stonk.ninja server`, providing a user-friendly interface to interact with and understand complex market data. It also offers real-time visualizations for market activity, allowing users to monitor market trends and make informed decisions. 

## Features ✨
- **Real-time visualizations**: The client provides real-time visualizations (candlesticks and related charts) for market activity, enabling users to track market trends and fluctuations as they happen.
- **Simulation visualizations**: Users can visualize simulated trading strategies, providing a risk-free environment to test and refine trading strategies before implementing them in the real market.
- **Watchlist management**: Users can create and manage watchlists, allowing them to monitor specific securities, derivatives, and cryptocurrencies of interest.

## Technology 💻

`stonk.ninja client` is written in TypeScript, a statically typed superset of JavaScript. It leverages the power of `Next.js` and `React` frameworks for fast and efficient web development.

## Getting Started 🚀

### Prerequisites
1. Nodejs >= 18.19.0: You can download and install Nodejs from the official website [here](https://nodejs.org/en/download).
2. pnpm package manager: Pnpm is used to manage dependencies in the project. You can install it by following the instructions in the official documentation [here](https://pnpm.io/installation).

### Installation
1. Clone the repository
```bash
git clone https://github.com/brayn003/stonk.ninja.git
```
2. Navigate to the project directory
```bash
cd client
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
To run `stonk.ninja server` locally, run the following command:
```bash
pnpm run dev
```


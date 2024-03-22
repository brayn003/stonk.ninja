declare module "kiteconnect" {
  //   import { KiteTicker } from "kiteconnect";

  //   class KiteTicker {
  //     constructor(options: { api_key: string; access_token: string });
  //     connect(): void;
  //     on(event: "ticks", cb: (ticks: Tick[]) => void): void;
  //     on(event: "connect", cb: () => void): void;
  //     on(event: "error", cb: (err: Error) => void): void;
  //     subscribe(instruments: number[]): void;
  //     setMode(mode: "full" | "ltp" | "quote", instruments: number[]): void;
  //     modeFull: "full";
  //     modeLTP: "ltp";
  //     modeQuote: "quote";
  //   }

  //   export { KiteTicker };

  interface KiteTickerParams {
    /**
     * API key issued you.
     */
    api_key: string;
    /**
     * Access token obtained after successful login flow.
     */
    access_token: string;
    /**
     * Enable/Disable auto reconnect. Enabled by default.
     */
    reconnect?: boolean;
    /**
     * is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
     */
    max_retry?: number;
    /**
     * in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
     */
    max_delay?: number;
  }

  export class KiteTicker {
    constructor(options: KiteTickerParams);
    /**
     * Set mode full
     */
    modeFull: "full";
    /**
     * this.modeLTP
     */
    modeLTP: "ltp";
    /**
     * this.modeQuote
     */
    modeQuote: "quote";

    /**
     * Auto reconnect settings
     * @param Enable or disable auto disconnect, defaults to false
     * @param max_retry is maximum number re-connection attempts. Defaults to 50 attempts and maximum up to 300 attempts.
     * @param max_delay in seconds is the maximum delay after which subsequent re-connection interval will become constant. Defaults to 60s and minimum acceptable value is 5s.
     * @returns
     */
    autoReconnect: (Enable: boolean, max_retry?: number, max_delay?: number) => void;
    /**
     * Initiate a websocket connection
     */
    connect: () => void;
    /**
     * Check if the ticker is connected
     */
    connected: () => boolean;
    /**
     * Check if the ticker is connected
     */
    disconnect: () => boolean;
    /**
     * Register websocket event callbacks
     * Available events
     * ~~~~
     * connect -  when connection is successfully established.
     * ticks - when ticks are available (Arrays of `ticks` object as the first argument).
     * disconnect - when socket connection is disconnected. Error is received as a first param.
     * error - when socket connection is closed with error. Error is received as a first param.
     * close - when socket connection is closed cleanly.
     * reconnect - When reconnecting (current re-connection count and reconnect interval as arguments respectively).
     * noreconnect - When re-connection fails after n number times.
     * order_update - When order update (postback) is received for the connected user (Data object is received as first argument).
     * message - when binary message is received from the server.
     * ~~~~
     *
     * @example
     * ticker.on('ticks', callback);
     * ticker.on('connect', callback);
     * ticker.on('disconnect', callback);
     */
    on: (
      event: "connect" | "ticks" | "disconnect" | "error" | "close" | "reconnect" | "noreconnect" | "order_update",
      callback: (...args: any[]) => void,
    ) => void;

    /**
     * Set modes to array of tokens
     * @param mode mode to set
     * @param tokens Array of tokens to be subscribed
     *
     * @example
     * ticker.setMode(ticker.modeFull, [738561]);
     */
    setMode: (mode: "ltp" | "quote" | "full", tokens: number[]) => number[];
    /**
     * Subscribe to array of tokens
     * @param tokens Array of tokens to be subscribed
     *
     * @example
     * ticker.subscribe([738561]);
     */
    subscribe: (tokens: number[]) => number[];
    /**
     * Unsubscribe to array of tokens
     * @param tokens Array of tokens to be unsubscribed
     *
     * @example
     * ticker.unsubscribe([738561]);
     */
    unsubscribe: (tokens: number[]) => number[];
  }
}

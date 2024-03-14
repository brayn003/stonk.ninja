interface TickDepthLevel {
  quantity: number;
  price: number;
  orders: number;
}

export interface Tick {
  tradable: boolean;
  mode: "full" | "ltp" | "quote";
  instrument_token: number;
  last_price: number;
  last_traded_quantity: number;
  average_traded_price: number;
  volume_traded: number;
  total_buy_quantity: number;
  total_sell_quantity: number;
  change: number;
  last_trade_time: Date;
  oi: number;
  oi_day_high: number;
  oi_day_low: number;
  exchange_timestamp: Date;
  depth: {
    buy: TickDepthLevel[];
    sell: TickDepthLevel[];
  };
}

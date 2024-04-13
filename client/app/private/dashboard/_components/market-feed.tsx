"use client";

import type { IChartApi, UTCTimestamp } from "lightweight-charts";
import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import useSWRImmutable from "swr/immutable";

interface KiteTick {
  tradable: boolean;
  mode: "full" | "ltp" | "quote";
  instrument_token: number;
  last_price: number;
  last_traded_quantity: number;
  average_traded_price: number;
  volume_traded: number;
  total_buy_quantity: number;
  total_sell_quantity: number;
  ohlc: { open: number; high: number; low: number; close: number };
  change: number;
  last_trade_time: string; // date;
  oi: number;
  oi_day_high: number;
  oi_day_low: number;
  exchange_timestamp: string; // date;
  depth: {
    buy: Array<{ quantity: number; price: number; order: number }>;
    sell: Array<{ quantity: number; price: number; order: number }>;
  };
}

interface Tick {
  id: string;
  timestamp: string; // date;
  metadata: {
    instrument_token: string;
    tradingsymbol: string;
  };
  data: KiteTick;
  received_at: string; // date;
}

interface APITickResponse {
  ticks: Tick[];
}

export function MarketFeed() {
  const { data, isLoading } = useSWRImmutable("/api/ticks/HDFCBANK", async (url) => {
    const res = await fetch(url);
    return (await res.json()) as APITickResponse;
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;
    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
      },
    });
    chartRef.current.timeScale().fitContent();

    const newSeries = chartRef.current.addLineSeries();
    const chartData = data.ticks.map<{ time: UTCTimestamp; value: number }>((tick) => ({
      time: (new Date(tick.received_at).getTime() / 1000) as UTCTimestamp,
      value: tick.data.last_price,
    }));
    newSeries.setData(chartData);

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  //   const { data, loading } = useQuery(GET_MARKET_FEED);
  console.log({ isLoading, data });
  return <div ref={containerRef} />;
}

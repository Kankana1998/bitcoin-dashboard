import { useState, useEffect, useCallback, useRef } from "react";
import type { BybitTickerData } from "../types/bybit";

const BYBIT_WS_URL = "wss://stream.bybit.com/v5/public/linear";
const RECONNECT_DELAY = 3000;

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface PricePoint {
  time: number;
  price: number;
}

export function useByBitWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [data, setData] = useState<BybitTickerData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [priceChangeDirection, setPriceChangeDirection] = useState<
    "up" | "down" | null
  >(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const priceChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastPriceRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket(BYBIT_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: ["tickers.BTCUSDT"],
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.topic === "tickers.BTCUSDT" && message.data) {
          const tickerData = message.data as Partial<BybitTickerData>;

          setData((prev) => {
            return { ...prev, ...tickerData } as BybitTickerData;
          });

          if (tickerData.lastPrice) {
            const currentPrice = parseFloat(tickerData.lastPrice);

            if (
              lastPriceRef.current !== null &&
              lastPriceRef.current !== currentPrice
            ) {
              setPriceChangeDirection(
                currentPrice > lastPriceRef.current ? "up" : "down",
              );

              if (priceChangeTimeoutRef.current) {
                clearTimeout(priceChangeTimeoutRef.current);
              }
              // Reset highlight after 1s
              priceChangeTimeoutRef.current = setTimeout(
                () => setPriceChangeDirection(null),
                1000,
              );
            }

            lastPriceRef.current = currentPrice;

            setPriceHistory((history) => {
              const now = Date.now();
              const newPoint = { time: now, price: currentPrice };
              const filtered = history.filter((p) => now - p.time <= 60000);
              return [...filtered, newPoint];
            });
          }
        }
      } catch (err) {
        console.error("Error parsing WebSocket message", err);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      // Attempt to reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, RECONNECT_DELAY);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (priceChangeTimeoutRef.current) {
        clearTimeout(priceChangeTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { status, data, priceHistory, priceChangeDirection };
}

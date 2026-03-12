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
  const [error, setError] = useState<string | null>(null);
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
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const connectRef = useRef<() => void>(() => {});

  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

  
    
    try {
      const ws = new WebSocket(BYBIT_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        reconnectAttemptsRef.current = 0; 
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
          if (message.ret_msg === "pong") return;
          if (message.op === "subscribe" && !message.success) {
            console.error("ByBit subscription failed:", message.ret_msg);
            setError("Failed to subscribe to market data.");
            return;
          }

          if (message.topic === "tickers.BTCUSDT" && message.data) {
            const tickerData = message.data as Partial<BybitTickerData>;
            setData((prev) => ({ ...prev, ...tickerData } as BybitTickerData));

            if (tickerData.lastPrice) {
              const currentPrice = parseFloat(tickerData.lastPrice);
              if (lastPriceRef.current !== null && lastPriceRef.current !== currentPrice) {
                setPriceChangeDirection(currentPrice > lastPriceRef.current ? "up" : "down");
                if (priceChangeTimeoutRef.current) clearTimeout(priceChangeTimeoutRef.current);
                priceChangeTimeoutRef.current = setTimeout(() => setPriceChangeDirection(null), 1000);
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

      ws.onclose = (event) => {
        setStatus("disconnected");
        if (event.code !== 1000) {
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(() => {
              connectRef.current(); 
            }, RECONNECT_DELAY);
          } else {
            setError("Connection lost. Please check your internet connection.");
          }
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setStatus("disconnected");
      setError("Failed to establish connection.");
    }
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    // Handle initial connection 
    const triggerConnection = async () => {
      setStatus("connecting");
      connect();
    };
    
    triggerConnection();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (priceChangeTimeoutRef.current) clearTimeout(priceChangeTimeoutRef.current);
      if (wsRef.current) wsRef.current.close(1000, "Component unmounted");
    };
  }, [connect]);

  const retry = useCallback(() => {
    setStatus("connecting");
    setError(null);
    connect();
  }, [connect]);

  return { status, error, data, priceHistory, priceChangeDirection, retry };
}

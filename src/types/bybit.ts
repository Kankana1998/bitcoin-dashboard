export interface BybitTickerData {
  symbol: string;
  lastPrice: string;
  markPrice: string;
  highPrice24h: string;
  lowPrice24h: string;
  turnover24h: string;
  price24hPcnt: string;
}

export interface BybitMessage {
  topic: string;
  type: string;
  data: BybitTickerData;
  cs: number;
  ts: number;
}

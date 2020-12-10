export interface Product {
  s: string; // symbol
  q: string; // quote
  o: string; // open
  h: string; // high
  l: string; // low
  c: string; // latest
  e: string;
  v: string;
  E: number;
}

export interface Resposne {
  data: Product[];
}

export const createProductsStream = (): WebSocket =>
  new WebSocket('wss://stream.binance.com/stream?streams=!miniTicker@arr');

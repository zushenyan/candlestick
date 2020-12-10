export const createCandlestickStream = (): WebSocket =>
  new WebSocket('wss://stream.binance.com/stream?streams=btcusdt@kline_1m');

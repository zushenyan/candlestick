export type Candlestick = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

export type CandlestickResponse = Array<Candlestick>;

export const getCandlesticks = async (): Promise<CandlestickResponse> => {
  const response = await fetch(
    'https://www.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1m'
  );
  return await response.json();
};

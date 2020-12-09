type _KlineResponse = [
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

export type KlinesResponse = Array<Array<_KlineResponse>>;

export const getKlines = async (): Promise<KlinesResponse> => {
  const response = await fetch(
    'https://www.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1m'
  );
  return await response.json();
};

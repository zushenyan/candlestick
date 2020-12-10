export interface DataElement {
  s: string; // symbol
  q: string; // quote asset
  o: number; // open price
  h: number; // high price
  l: number; // low price
  c: number; // latest price
  b: string; // base asset
  pm: string; // parent market
  pn: string; // category of the parent market
}

export interface ProductsRepsonse {
  data: DataElement[];
}

export const getProducts = async (): Promise<ProductsRepsonse> => {
  const response = await fetch(
    'https://www.binance.com/exchange-api/v1/public/asset-service/product/get-products'
  );
  return await response.json();
};

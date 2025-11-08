export interface TokenData {
  token_address: string;
  token_name: string;
  token_ticker: string;
  price_sol: number;
  market_cap_sol: number;
  volume_sol: number;
  liquidity_sol: number;
  transaction_count: number;
  price_1hr_change: number;
  protocol: string;
  last_updated?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    next_cursor?: string;
    has_more: boolean;
  };
}

export enum SortBy {
  VOLUME = 'volume',
  PRICE_CHANGE = 'price_change',
  MARKET_CAP = 'market_cap',
  LIQUIDITY = 'liquidity'
}

export enum TimePeriod {
  ONE_HOUR = '1h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d'
}

export interface FilterOptions {
  sort_by?: SortBy;
  time_period?: TimePeriod;
  limit?: number;
  cursor?: string;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string; };
  quoteToken: { address: string; name: string; symbol: string; };
  priceNative: string;
  priceUsd?: string;
  volume?: { h24: number; };
  priceChange?: { h1: number; h24: number; };
  liquidity?: { usd: number; base: number; quote: number; };
  fdv?: number;
  marketCap?: number;
  txns?: { h1?: { buys: number; sells: number }; h24?: { buys: number; sells: number }; };
}

export interface JupiterPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

export interface WebSocketUpdate {
  type: 'price_update' | 'volume_spike' | 'initial_data';
  tokens: TokenData[];
  timestamp: number;
}

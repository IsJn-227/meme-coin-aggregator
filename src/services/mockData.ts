import { TokenData } from '../types';

export const mockTokenData: TokenData[] = [
  {
    token_address: 'So11111111111111111111111111111111111111112',
    token_name: 'Wrapped SOL',
    token_ticker: 'SOL',
    price_sol: 1.0,
    market_cap_sol: 1000000,
    volume_sol: 50000,
    liquidity_sol: 100000,
    transaction_count: 5000,
    price_1hr_change: 2.5,
    protocol: 'Raydium',
    last_updated: Date.now()
  },
  {
    token_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    token_name: 'USD Coin',
    token_ticker: 'USDC',
    price_sol: 0.0045,
    market_cap_sol: 500000,
    volume_sol: 30000,
    liquidity_sol: 80000,
    transaction_count: 3000,
    price_1hr_change: 0.1,
    protocol: 'Orca',
    last_updated: Date.now()
  },
  {
    token_address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    token_name: 'USDT',
    token_ticker: 'USDT',
    price_sol: 0.0044,
    market_cap_sol: 450000,
    volume_sol: 28000,
    liquidity_sol: 75000,
    transaction_count: 2800,
    price_1hr_change: -0.2,
    protocol: 'Raydium',
    last_updated: Date.now()
  }
];

export function getMockTokens(count: number = 20): TokenData[] {
  const tokens: TokenData[] = [...mockTokenData];
  
  // Generate more mock tokens
  for (let i = tokens.length; i < count; i++) {
    tokens.push({
      token_address: 'Mock' + Math.random().toString(36).substring(7) + i,
      token_name: 'Mock Token ' + (i + 1),
      token_ticker: 'MOCK' + (i + 1),
      price_sol: Math.random() * 0.01,
      market_cap_sol: Math.random() * 100000,
      volume_sol: Math.random() * 10000,
      liquidity_sol: Math.random() * 20000,
      transaction_count: Math.floor(Math.random() * 1000),
      price_1hr_change: (Math.random() - 0.5) * 20,
      protocol: ['Raydium', 'Orca', 'Serum'][Math.floor(Math.random() * 3)],
      last_updated: Date.now()
    });
  }
  
  return tokens;
}

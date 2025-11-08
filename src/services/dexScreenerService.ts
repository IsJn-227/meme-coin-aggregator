import axios from 'axios';
import https from 'https';
import { config } from '../config';
import { DexScreenerPair, TokenData } from '../types';
import RateLimiter, { ExponentialBackoff } from '../utils/rateLimiter';
import logger from '../utils/logger';

// Create axios instance with SSL configuration and headers
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }
});

class DexScreenerService {
  private rateLimiter: RateLimiter;
  private backoff: ExponentialBackoff;
  private baseUrl: string;

  constructor() {
    this.rateLimiter = new RateLimiter(config.dexScreenerRateLimit, 60000);
    this.backoff = new ExponentialBackoff();
    this.baseUrl = config.apis.dexScreener;
  }

  async searchTokens(query: string = 'solana'): Promise<TokenData[]> {
    await this.rateLimiter.waitForSlot('dexscreener');

    return this.backoff.execute(async () => {
      try {
        const response = await axiosInstance.get(this.baseUrl + '/search', {
          params: { q: query },
          timeout: 15000
        });

        const pairs: DexScreenerPair[] = response.data.pairs || [];
        logger.info('DexScreener returned ' + pairs.length + ' pairs');
        return this.transformPairs(pairs);
      } catch (error: any) {
        logger.error('DexScreener search error', error.message);
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (error.response?.status === 403) {
          logger.warn('DexScreener blocking request, returning empty array');
          return [];
        }
        throw error;
      }
    }, 'DexScreener search');
  }

  async getTokenByAddress(address: string): Promise<TokenData | null> {
    await this.rateLimiter.waitForSlot('dexscreener');

    return this.backoff.execute(async () => {
      try {
        const response = await axiosInstance.get(this.baseUrl + '/tokens/' + address, {
          timeout: 15000
        });

        const pairs: DexScreenerPair[] = response.data.pairs || [];
        if (pairs.length === 0) return null;

        const transformed = this.transformPairs(pairs);
        return transformed[0] || null;
      } catch (error: any) {
        logger.error('DexScreener token fetch error for ' + address, error.message);
        if (error.response?.status === 404) return null;
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        if (error.response?.status === 403) {
          logger.warn('DexScreener blocking request');
          return null;
        }
        throw error;
      }
    }, 'DexScreener token fetch (' + address + ')');
  }

  private transformPairs(pairs: DexScreenerPair[]): TokenData[] {
    return pairs
      .filter(pair => pair.chainId === 'solana')
      .map(pair => ({
        token_address: pair.baseToken.address,
        token_name: pair.baseToken.name,
        token_ticker: pair.baseToken.symbol,
        price_sol: parseFloat(pair.priceNative) || 0,
        market_cap_sol: (pair.marketCap || pair.fdv || 0) / (pair.priceUsd ? parseFloat(pair.priceUsd) : 1),
        volume_sol: (pair.volume?.h24 || 0) / (pair.priceUsd ? parseFloat(pair.priceUsd) : 1),
        liquidity_sol: (pair.liquidity?.quote || 0),
        transaction_count: ((pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)),
        price_1hr_change: pair.priceChange?.h1 || 0,
        protocol: pair.dexId || 'Unknown',
        last_updated: Date.now()
      }));
  }
}

export const dexScreenerService = new DexScreenerService();

import axios from 'axios';
import https from 'https';
import { config } from '../config';
import { TokenData } from '../types';
import { ExponentialBackoff } from '../utils/rateLimiter';
import logger from '../utils/logger';

// Create axios instance with SSL configuration
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

class JupiterService {
  private backoff: ExponentialBackoff;
  private baseUrl: string;

  constructor() {
    this.backoff = new ExponentialBackoff();
    this.baseUrl = config.apis.jupiter;
  }

  async getPrices(tokenIds: string[]): Promise<Map<string, number>> {
    if (tokenIds.length === 0) return new Map();

    return this.backoff.execute(async () => {
      try {
        const ids = tokenIds.join(',');
        const response = await axiosInstance.get(this.baseUrl, {
          params: { ids },
          timeout: 10000
        });

        const priceMap = new Map<string, number>();
        const data = response.data.data || {};

        Object.entries(data).forEach(([id, priceData]: [string, any]) => {
          if (priceData && priceData.price) {
            priceMap.set(id, priceData.price);
          }
        });

        logger.debug('Jupiter fetched prices for ' + priceMap.size + ' tokens');
        return priceMap;
      } catch (error: any) {
        logger.error('Jupiter price fetch error', error);
        throw error;
      }
    }, 'Jupiter price fetch');
  }

  async enrichTokenData(tokens: TokenData[]): Promise<TokenData[]> {
    const tokenIds = tokens.map(t => t.token_address).slice(0, 100);
    
    try {
      const priceMap = await this.getPrices(tokenIds);

      return tokens.map(token => {
        const jupiterPrice = priceMap.get(token.token_address);
        if (jupiterPrice && jupiterPrice > 0) {
          return {
            ...token,
            price_sol: jupiterPrice
          };
        }
        return token;
      });
    } catch (error) {
      logger.warn('Failed to enrich with Jupiter prices, using original data');
      return tokens;
    }
  }
}

export const jupiterService = new JupiterService();

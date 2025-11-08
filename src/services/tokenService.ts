import { TokenData, PaginatedResponse } from '../types';
import { dexScreenerService } from './dexScreenerService';
import { jupiterService } from './jupiterService';
import cacheService from './cacheService';
import { getMockTokens } from './mockData';
import logger from '../utils/logger';

interface TokenQueryOptions {
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  timePeriod?: string;
}

class TokenService {
  private readonly CACHE_KEY = 'tokens:all';
  private readonly TOKEN_CACHE_PREFIX = 'token:';

  async getTokens(options: TokenQueryOptions = {}): Promise<PaginatedResponse<TokenData>> {
    const {
      limit = 30,
      cursor,
      sortBy = 'volume_sol',
      sortOrder = 'desc',
      timePeriod = '24h'
    } = options;

    try {
      // Try cache first
      const cacheKey = this.CACHE_KEY + ':sorted:' + sortBy + ':' + sortOrder;
      let tokens = await cacheService.get(cacheKey);

      if (!tokens) {
        logger.info('Cache miss - fetching from APIs');
        tokens = await this.aggregateTokenData();
        
        // Cache the aggregated data
        await cacheService.set(cacheKey, tokens, 30);
      } else {
        logger.info('Cache hit - returning ' + tokens.length + ' tokens');
      }

      // Apply sorting
      tokens = this.sortTokens(tokens, sortBy, sortOrder);

      // Apply pagination
      const startIndex = cursor ? parseInt(cursor) : 0;
      const endIndex = startIndex + limit;
      const paginatedTokens = tokens.slice(startIndex, endIndex);
      const hasMore = endIndex < tokens.length;

      return {
        data: paginatedTokens,
        pagination: {
          limit,
          next_cursor: hasMore ? endIndex.toString() : undefined,
          has_more: hasMore
        }
      };
    } catch (error) {
      logger.error('Error fetching tokens', error);
      throw error;
    }
  }

  async getTokenByAddress(address: string): Promise<TokenData | null> {
    try {
      // Check cache first
      const cacheKey = this.TOKEN_CACHE_PREFIX + address;
      let token = await cacheService.get(cacheKey);

      if (!token) {
        logger.info('Cache miss for token ' + address);
        token = await dexScreenerService.getTokenByAddress(address);
        
        if (token) {
          await cacheService.set(cacheKey, token, 30);
        }
      } else {
        logger.info('Cache hit for token ' + address);
      }

      return token;
    } catch (error) {
      logger.error('Error fetching token ' + address, error);
      throw error;
    }
  }

  private async aggregateTokenData(): Promise<TokenData[]> {
    try {
      // Fetch from DexScreener
      const dexTokens = await dexScreenerService.searchTokens('solana');
      
      if (dexTokens.length === 0) {
        logger.warn('No tokens from DexScreener, using mock data');
        return getMockTokens(50);
      }
      
      logger.info('Fetched ' + dexTokens.length + ' tokens from DexScreener');

      // Enrich with Jupiter prices (skip if API fails)
      let enrichedTokens = dexTokens;
      try {
        enrichedTokens = await jupiterService.enrichTokenData(dexTokens);
      } catch (error) {
        logger.warn('Jupiter enrichment failed, using DexScreener data only');
      }

      // Merge duplicates by token address
      const tokenMap = new Map<string, TokenData>();
      
      enrichedTokens.forEach(token => {
        const existing = tokenMap.get(token.token_address);
        
        if (!existing || (token.volume_sol > existing.volume_sol)) {
          tokenMap.set(token.token_address, token);
        }
      });

      const mergedTokens = Array.from(tokenMap.values());
      logger.info('Aggregated ' + mergedTokens.length + ' unique tokens');

      return mergedTokens;
    } catch (error) {
      logger.error('Error aggregating token data, using mock data', error);
      return getMockTokens(50);
    }
  }

  private sortTokens(tokens: TokenData[], sortBy: string, order: 'asc' | 'desc'): TokenData[] {
    const sorted = [...tokens].sort((a, b) => {
      let aVal: number = 0;
      let bVal: number = 0;

      switch (sortBy) {
        case 'volume_sol':
          aVal = a.volume_sol;
          bVal = b.volume_sol;
          break;
        case 'price_1hr_change':
          aVal = a.price_1hr_change;
          bVal = b.price_1hr_change;
          break;
        case 'market_cap_sol':
          aVal = a.market_cap_sol;
          bVal = b.market_cap_sol;
          break;
        case 'liquidity_sol':
          aVal = a.liquidity_sol;
          bVal = b.liquidity_sol;
          break;
        default:
          aVal = a.volume_sol;
          bVal = b.volume_sol;
      }

      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }

  async clearCache(): Promise<void> {
    await cacheService.clear('tokens:*');
    await cacheService.clear('token:*');
    logger.info('Token cache cleared');
  }
}

export const tokenService = new TokenService();

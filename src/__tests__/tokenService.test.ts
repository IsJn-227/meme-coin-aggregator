import { tokenService } from '../services/tokenService';
import cacheService from '../services/cacheService';

jest.mock('../services/cacheService');

const mockCacheService = cacheService as jest.Mocked<typeof cacheService>;

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokens - Happy Path', () => {
    test('should return tokens with default parameters', async () => {
      const mockTokens = [
        {
          token_address: 'test123',
          token_name: 'Test Token',
          token_ticker: 'TEST',
          price_sol: 1.5,
          volume_sol: 1000,
          market_cap_sol: 50000,
          liquidity_sol: 10000,
          transaction_count: 100,
          price_1hr_change: 5.5,
          protocol: 'Raydium'
        }
      ];

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({});

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    test('should return tokens with pagination limit', async () => {
      const mockTokens = Array(30).fill(null).map((_, i) => ({
        token_address: `addr${i}`,
        token_name: `Token ${i}`,
        token_ticker: `TK${i}`,
        price_sol: i + 1,
        volume_sol: (i + 1) * 100,
        market_cap_sol: (i + 1) * 1000,
        liquidity_sol: 1000,
        transaction_count: 100,
        price_1hr_change: 5,
        protocol: 'Raydium'
      }));

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ limit: 10 });

      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination).toBeDefined();
    });

    test('should sort tokens by volume descending', async () => {
      const mockTokens = [
        { token_address: '1', volume_sol: 100, token_name: 'A', token_ticker: 'A', price_sol: 1, market_cap_sol: 1000, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' },
        { token_address: '2', volume_sol: 500, token_name: 'B', token_ticker: 'B', price_sol: 1, market_cap_sol: 1000, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' },
        { token_address: '3', volume_sol: 300, token_name: 'C', token_ticker: 'C', price_sol: 1, market_cap_sol: 1000, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' }
      ];

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ sortBy: 'volume_sol', sortOrder: 'desc' });

      expect(result.data[0].volume_sol).toBeGreaterThanOrEqual(result.data[1].volume_sol);
    });

    test('should sort tokens by market cap ascending', async () => {
      const mockTokens = [
        { token_address: '1', market_cap_sol: 5000, token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: 100, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' },
        { token_address: '2', market_cap_sol: 1000, token_name: 'B', token_ticker: 'B', price_sol: 1, volume_sol: 100, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' },
        { token_address: '3', market_cap_sol: 3000, token_name: 'C', token_ticker: 'C', price_sol: 1, volume_sol: 100, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' }
      ];

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ sortBy: 'market_cap_sol', sortOrder: 'asc' });

      expect(result.data[0].market_cap_sol).toBeLessThanOrEqual(result.data[1].market_cap_sol);
    });

    test('should handle pagination with cursor', async () => {
      const mockTokens = Array(50).fill(null).map((_, i) => ({
        token_address: `addr${i}`,
        token_name: `Token ${i}`,
        token_ticker: `TK${i}`,
        price_sol: 1,
        volume_sol: 100,
        market_cap_sol: 1000,
        liquidity_sol: 1000,
        transaction_count: 10,
        price_1hr_change: 5,
        protocol: 'Raydium'
      }));

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ limit: 10, cursor: '10' });

      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getTokens - Edge Cases', () => {
    test('should handle cache miss and fetch from APIs', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockCacheService.set.mockResolvedValue(undefined);

      const result = await tokenService.getTokens({});

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('should handle invalid limit (negative)', async () => {
      const mockTokens = [
        { token_address: '1', token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: 100, market_cap_sol: 1000, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' }
      ];

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ limit: -10 });

      expect(result.data).toBeDefined();
    });

    test('should handle invalid limit (zero)', async () => {
      const mockTokens = [
        { token_address: '1', token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: 100, market_cap_sol: 1000, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' }
      ];

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ limit: 0 });

      expect(result.data).toBeDefined();
    });

    test('should handle very large limit', async () => {
      const mockTokens = Array(10).fill(null).map((_, i) => ({
        token_address: `addr${i}`,
        token_name: `Token ${i}`,
        token_ticker: `TK${i}`,
        price_sol: 1,
        volume_sol: 100,
        market_cap_sol: 1000,
        liquidity_sol: 1000,
        transaction_count: 10,
        price_1hr_change: 5,
        protocol: 'Raydium'
      }));

      mockCacheService.get.mockResolvedValue(mockTokens);

      const result = await tokenService.getTokens({ limit: 10000 });

      expect(result.data.length).toBeLessThanOrEqual(mockTokens.length);
    });

    test('should handle empty token array', async () => {
      mockCacheService.get.mockResolvedValue([]);

      const result = await tokenService.getTokens({});

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

   test('should handle invalid sort order', async () => {
      const mockTokens = [
        { token_address: '1', token_name: 'A', token_ticker: 'A', price_sol: 1, volume_sol: 100, market_cap_sol: 1000, liquidity_sol: 1000, transaction_count: 10, price_1hr_change: 5, protocol: 'Raydium' }
      ];
      mockCacheService.get.mockResolvedValue(mockTokens);
      const result = await tokenService.getTokens({ sortOrder: 'invalid' as any });
      expect(result.data).toBeDefined();
    });
  });
});
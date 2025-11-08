import { cacheService } from '../services/cacheService';
import { redisClient } from '../config/redis';

describe('Cache Service Tests', () => {
  beforeAll(async () => {
    if (!redisClient.isOpen) {
      try {
        await redisClient.connect();
      } catch (error) {
        console.log('Redis connection handled');
      }
    }
  });

  afterAll(async () => {
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    } catch (error) {
      console.log('Redis disconnect handled');
    }
  });

  beforeEach(async () => {
    if (redisClient.isOpen) {
      await cacheService.clear();
    }
  });

  it('should set and get cached data', async () => {
    const key = 'test:key';
    const value = { data: 'test value' };

    await cacheService.set(key, value, 10);
    const result = await cacheService.get(key);

    expect(result).toEqual(value);
  });

  it('should return null for non-existent key', async () => {
    const result = await cacheService.get('non:existent');
    expect(result).toBeNull();
  });

  it('should delete cached data', async () => {
    const key = 'test:delete';
    await cacheService.set(key, { data: 'test' }, 10);
    
    await cacheService.delete(key);
    const result = await cacheService.get(key);

    expect(result).toBeNull();
  });

  it('should check if key exists', async () => {
    const key = 'test:exists';
    await cacheService.set(key, { data: 'test' }, 10);

    const exists = await cacheService.exists(key);
    expect(exists).toBe(true);

    const notExists = await cacheService.exists('non:existent');
    expect(notExists).toBe(false);
  });

  it('should clear all cache', async () => {
    await cacheService.set('key1', { data: 1 }, 10);
    await cacheService.set('key2', { data: 2 }, 10);

    await cacheService.clear();

    const result1 = await cacheService.get('key1');
    const result2 = await cacheService.get('key2');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });
});

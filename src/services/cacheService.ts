import { getRedisClient } from '../config/redis';
import config from '../config';
import logger from '../utils/logger';

export class CacheService {
  private defaultTTL: number;

  constructor() {
    this.defaultTTL = config.cacheTTL;
  }

  async get(key: string): Promise<any> {
    try {
      const redis = getRedisClient();
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const redis = getRedisClient();
      const expiry = ttl || this.defaultTTL;
      await redis.set(key, JSON.stringify(value), 'EX', expiry);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async clear(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }
}

export default new CacheService();

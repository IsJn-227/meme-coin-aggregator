import { redisClient } from '../config/redis';
import { config } from '../config';
import logger from '../utils/logger';

export class CacheService {
  private ttl: number;

  constructor(ttl: number = config.cacheTTL) {
    this.ttl = ttl;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        logger.debug('Cache hit for key: ' + key);
        return JSON.parse(cached);
      }
      logger.debug('Cache miss for key: ' + key);
      return null;
    } catch (error) {
      logger.error('Cache get error for key ' + key, error);
      return null;
    }
  }

  async set(key: string, value: any, customTTL?: number): Promise<void> {
    try {
      const ttl = customTTL || this.ttl;
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      logger.debug('Cached key: ' + key + ' with TTL: ' + ttl + 's');
    } catch (error) {
      logger.error('Cache set error for key ' + key, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
      logger.debug('Deleted cache key: ' + key);
    } catch (error) {
      logger.error('Cache delete error for key ' + key, error);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          logger.info('Cleared ' + keys.length + ' cache keys matching pattern: ' + pattern);
        }
      } else {
        await redisClient.flushAll();
        logger.info('Cleared all cache');
      }
    } catch (error) {
      logger.error('Cache clear error', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists check error for key ' + key, error);
      return false;
    }
  }
}

export const cacheService = new CacheService();

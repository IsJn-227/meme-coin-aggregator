import { getRedisClient, closeRedisConnection } from '../config/redis';

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.REDIS_URL = 'redis://localhost:6379';
  
  try {
    const redis = getRedisClient();
    await redis.ping();
  } catch (error) {
    console.log('Redis not available for tests, using mock');
  }
});

afterAll(async () => {
  try {
    await closeRedisConnection();
  } catch (error) {
    console.log('Error closing Redis connection');
  }
});

jest.setTimeout(10000);

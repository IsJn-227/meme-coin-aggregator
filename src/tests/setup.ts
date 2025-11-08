import { redisClient } from '../config/redis';

beforeAll(async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (error) {
      console.log('Redis already connected or error:', error);
    }
  }
});

afterAll(async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.flushAll();
      await redisClient.quit();
    }
  } catch (error) {
    console.error('Error in test cleanup:', error);
  }
});

jest.setTimeout(30000);

import { createClient } from 'redis';
import { config } from './index';

export const redisClient = createClient({
  url: config.redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Too many Redis reconnection attempts');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('ready', () => console.log('Redis Client Ready'));

export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis() {
  try {
    await redisClient.quit();
  } catch (error) {
    console.error('Error disconnecting from Redis:', error);
  }
}

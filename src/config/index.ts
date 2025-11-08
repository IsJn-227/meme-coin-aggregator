import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheTTL: parseInt(process.env.CACHE_TTL || '30', 10),
  updateInterval: parseInt(process.env.UPDATE_INTERVAL || '10000', 10),
  dexScreenerRateLimit: parseInt(process.env.DEXSCREENER_RATE_LIMIT || '300', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  apis: {
    dexScreener: 'https://api.dexscreener.com/latest/dex',
    jupiter: 'https://price.jup.ag/v4/price',
    geckoTerminal: 'https://api.geckoterminal.com/api/v2'
  },
  
  solanaTokens: [
    'So11111111111111111111111111111111111111112',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  ],
  
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
};

export default config;

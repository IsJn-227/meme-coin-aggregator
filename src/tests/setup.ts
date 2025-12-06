// Jest setup file
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.CACHE_TTL = '30';
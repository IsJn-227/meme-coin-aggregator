import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config';
import { connectRedis } from './config/redis';
import tokenRoutes from './routes/tokenRoutes';
import { WebSocketHandler } from './websocket/handler';
import logger from './utils/logger';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(req.method + ' ' + req.path + ' ' + res.statusCode + ' - ' + duration + 'ms');
  });
  next();
});

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/tokens', tokenRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Initialize WebSocket
let wsHandler: WebSocketHandler;

async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Initialize WebSocket handler
    wsHandler = new WebSocketHandler(httpServer);
    logger.info('WebSocket handler initialized');

    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info('Server running on port ' + config.port);
      logger.info('Environment: ' + config.nodeEnv);
      logger.info('Health check: http://localhost:' + config.port + '/health');
      logger.info('API endpoint: http://localhost:' + config.port + '/api/tokens');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (wsHandler) wsHandler.stop();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (wsHandler) wsHandler.stop();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app;

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import tokenRoutes from './routes/tokenRoutes';
import logger from './utils/logger';
import { WebSocketService } from './services/websocketService';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', tokenRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server and WebSocket
const httpServer = createServer(app);
const wsService = new WebSocketService(httpServer);

// Start periodic updates
wsService.startPeriodicUpdates();

const PORT = config.port;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('WebSocket server initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  wsService.stopPeriodicUpdates();
  httpServer.close();
});

export default app;

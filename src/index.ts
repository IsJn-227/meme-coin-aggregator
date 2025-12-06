import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import tokenRoutes from './routes/tokenRoutes';
import logger from './utils/logger';
import { WebSocketService } from './services/websocketService';
import path from "path";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api', tokenRoutes);
// ----------------------
// Serve Frontend (Static Files)
// ----------------------
app.use(express.static(path.join(__dirname, "../public")));

app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const httpServer = createServer(app);
const wsService = new WebSocketService(httpServer);
wsService.startPeriodicUpdates();

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('WebSocket server initialized');
});

process.on('SIGTERM', () => {
  wsService.stopPeriodicUpdates();
  httpServer.close();
});

export default app;

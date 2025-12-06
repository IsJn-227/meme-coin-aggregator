import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config';
import tokenRoutes from './routes/tokenRoutes';
import logger from './utils/logger';
import path from "path";

// NEW — WebSocket import
import { WebSocketServer } from "ws";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', tokenRoutes);

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "../public")));

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const httpServer = createServer(app);

// =====================================================
//            ✅ FIXED WEBSOCKET SERVER HERE
// =====================================================
const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws"          // IMPORTANT: this MUST match frontend
});

wss.on("connection", (socket) => {
  logger.info("🔌 WebSocket client connected");

  socket.send(JSON.stringify({ message: "WebSocket connected" }));

  socket.on("message", (msg) => {
    logger.info("Received WS message: " + msg.toString());
  });

  socket.on("close", () => {
    logger.info("WebSocket client disconnected");
  });
});

// =====================================================
//                START SERVER
// =====================================================
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('WebSocket server initialized at /ws');
});

process.on('SIGTERM', () => {
  httpServer.close();
});

export default app;

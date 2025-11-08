import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { tokenService } from './tokenService';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: SocketServer;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('subscribe:tokens', () => {
        logger.debug(`Client ${socket.id} subscribed to token updates`);
        socket.join('token-updates');
        
        // Send initial data
        this.sendTokenUpdate(socket.id);
      });

      socket.on('unsubscribe:tokens', () => {
        logger.debug(`Client ${socket.id} unsubscribed from token updates`);
        socket.leave('token-updates');
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private async sendTokenUpdate(socketId?: string): Promise<void> {
    try {
      const tokens = await tokenService.getTokens({
        limit: 50,
        sortBy: 'volume_sol',
        sortOrder: 'desc'
      });

      const update = {
        timestamp: new Date().toISOString(),
        tokens: tokens.data,
        count: tokens.data.length
      };

      if (socketId) {
        this.io.to(socketId).emit('tokens:update', update);
      } else {
        this.io.to('token-updates').emit('tokens:update', update);
      }

      logger.debug(`Sent token update to ${socketId || 'all subscribers'}`);
    } catch (error) {
      logger.error('Error sending token update', error);
    }
  }

  public startPeriodicUpdates(): void {
    if (this.updateInterval) {
      return;
    }

    logger.info(`Starting periodic WebSocket updates every ${this.UPDATE_INTERVAL / 1000}s`);

    this.updateInterval = setInterval(async () => {
      const socketsInRoom = await this.io.in('token-updates').fetchSockets();
      if (socketsInRoom.length > 0) {
        await this.sendTokenUpdate();
      }
    }, this.UPDATE_INTERVAL);
  }

  public stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Stopped periodic WebSocket updates');
    }
  }

  public getIO(): SocketServer {
    return this.io;
  }
}

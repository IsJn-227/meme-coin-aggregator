import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { tokenService } from '../services/tokenService';
import logger from '../utils/logger';

export class WebSocketHandler {
  private io: SocketIOServer;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Client connected: ' + socket.id);

      socket.on('subscribe:tokens', async (filters) => {
        logger.info('Client ' + socket.id + ' subscribed with filters:', filters);
        socket.join('tokens');
        
        // Send initial data
        await this.sendTokenUpdate(socket, filters);
      });

      socket.on('unsubscribe:tokens', () => {
        logger.info('Client ' + socket.id + ' unsubscribed from tokens');
        socket.leave('tokens');
      });

      socket.on('disconnect', () => {
        logger.info('Client disconnected: ' + socket.id);
      });
    });

    // Start periodic updates
    this.startPeriodicUpdates();
  }

  private async sendTokenUpdate(socket: any, filters: any = {}) {
    try {
      const tokens = await tokenService.getTokens({
        limit: filters.limit || 30,
        sortBy: filters.sortBy || 'volume_sol',
        sortOrder: filters.sortOrder || 'desc',
        timePeriod: filters.timePeriod || '24h'
      });

      socket.emit('tokens:update', {
        tokens: tokens.data,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('Error sending token update:', error);
      socket.emit('tokens:error', { 
        message: 'Failed to fetch token data' 
      });
    }
  }

  private startPeriodicUpdates() {
    // Update every 30 seconds
    this.updateInterval = setInterval(async () => {
      try {
        const tokens = await tokenService.getTokens({
          limit: 30,
          sortBy: 'volume_sol',
          sortOrder: 'desc'
        });

        this.io.to('tokens').emit('tokens:update', {
          tokens: tokens.data,
          timestamp: Date.now()
        });

        const clientCount = this.io.sockets.sockets.size;
        logger.info('Broadcast update to ' + clientCount + ' clients');
      } catch (error) {
        logger.error('Error in periodic update:', error);
      }
    }, 30000);
  }

  public stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.io.close();
  }
}

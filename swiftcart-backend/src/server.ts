// This log should appear immediately if file is being executed
console.log('🚀 SERVER.TS STARTING...');

import { createServer } from 'http';
import { env } from './config/env';
import logger from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { connectElasticsearch, disconnectElasticsearch } from './config/elasticsearch';
// import { initializeSocket, setSocketInstance } from './config/socket'; // Lazy load to avoid blocking
import app from './app';

const PORT = env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io - lazy load to avoid blocking
let io: any = null;
const initSocket = async () => {
  try {
    const socketModule = await import('./config/socket');
    io = socketModule.initializeSocket(httpServer);
    socketModule.setSocketInstance(io);
    logger.info('Socket.io initialized');
  } catch (error: any) {
    logger.warn('Socket.io initialization skipped:', error.message);
  }
};
initSocket();

// Connect to database and Redis, then start server
const startServer = async () => {
  try {
    console.log('🔄 Starting server initialization...');
    console.log(`📡 Connecting to MongoDB: ${env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') || 'not set'}`);
    
    // Connect to MongoDB
    console.log('⏳ Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ MongoDB connected');
    
    // Connect to Redis (non-blocking - app continues if Redis fails)
    console.log('⏳ Connecting to Redis...');
    await connectRedis().catch(() => {
      console.log('⚠️ Redis connection skipped (optional)');
    });
    
    // Connect to Elasticsearch (non-blocking - app continues if Elasticsearch fails)
    console.log('⏳ Connecting to Elasticsearch...');
    await connectElasticsearch().catch(() => {
      console.log('⚠️ Elasticsearch connection skipped (optional)');
    });
    
    // Start server with Socket.io
    console.log('⏳ Starting HTTP server...');
    httpServer.listen(PORT, () => {
      logger.info('🚀 Server started successfully', {
        port: PORT,
        environment: env.NODE_ENV,
        apiVersion: env.API_VERSION,
      });
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 API: http://localhost:${PORT}/api/${env.API_VERSION}`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.io: WebSocket server ready`);
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err: Error) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  console.error('Uncaught Exception:', err);
    await disconnectRedis();
    await disconnectElasticsearch();
    process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close Socket.io connections
    if (io) {
      io.close(() => {
        logger.info('Socket.io server closed');
      });
    }
    
    // Close HTTP server
    httpServer.close(() => {
      logger.info('HTTP server closed');
    });
    
    await disconnectRedis();
    await disconnectElasticsearch();
    process.exit(0);
  } catch (error: any) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


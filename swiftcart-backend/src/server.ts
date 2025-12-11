import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { connectElasticsearch, disconnectElasticsearch } from './config/elasticsearch';
import { env } from './config/env';
import logger from './utils/logger';
import { initializeSocket, setSocketInstance } from './config/socket';

const PORT = env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeSocket(httpServer);
setSocketInstance(io);

// Connect to database and Redis, then start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Connect to Redis (non-blocking - app continues if Redis fails)
    await connectRedis();
    
    // Connect to Elasticsearch (non-blocking - app continues if Elasticsearch fails)
    await connectElasticsearch();
    
    // Start server with Socket.io
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
    console.error('Failed to start server:', error);
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
    io.close(() => {
      logger.info('Socket.io server closed');
    });
    
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


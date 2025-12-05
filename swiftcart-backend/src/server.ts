import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { env } from './config/env';
import logger from './utils/logger';

const PORT = env.PORT;

// Connect to database and Redis, then start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Connect to Redis (non-blocking - app continues if Redis fails)
    await connectRedis();
    
    // Start server
    app.listen(PORT, () => {
      logger.info('🚀 Server started successfully', {
        port: PORT,
        environment: env.NODE_ENV,
        apiVersion: env.API_VERSION,
      });
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 API: http://localhost:${PORT}/api/${env.API_VERSION}`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
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
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    await disconnectRedis();
    process.exit(0);
  } catch (error: any) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


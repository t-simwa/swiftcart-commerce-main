import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import logger from './utils/logger';

const PORT = env.PORT;

// Connect to database
connectDatabase()
  .then(() => {
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
  })
  .catch((error) => {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  console.error('Uncaught Exception:', err);
  process.exit(1);
});


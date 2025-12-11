import mongoose from 'mongoose';
import logger from '../utils/logger';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log(`🔗 Attempting to connect to MongoDB...`);

    // Connection options for production-ready setup
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true, // Retry writes on network errors
      retryReads: true, // Retry reads on network errors
    };

    // Add timeout wrapper to prevent indefinite hanging
    const connectionPromise = mongoose.connect(mongoUri, options);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('MongoDB connection timeout after 15 seconds. Is MongoDB running?')), 15000)
    );

    const conn = await Promise.race([connectionPromise, timeoutPromise]);

    logger.info('MongoDB connected successfully', {
      host: conn.connection.host,
      database: conn.connection.name,
      readyState: conn.connection.readyState,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${getConnectionState(conn.connection.readyState)}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { 
        error: err.message, 
        stack: err.stack,
        name: err.name,
      });
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected', {
        readyState: mongoose.connection.readyState,
      });
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected', {
        host: mongoose.connection.host,
        database: mongoose.connection.name,
      });
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected', {
        host: mongoose.connection.host,
        database: mongoose.connection.name,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, closing MongoDB connection...`);
      console.log(`\n🛑 Received ${signal}, closing MongoDB connection...`);
      
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed gracefully');
        console.log('✅ MongoDB connection closed gracefully');
        process.exit(0);
      } catch (error: any) {
        logger.error('Error closing MongoDB connection', {
          error: error.message,
          stack: error.stack,
        });
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error: any) {
    logger.error('Database connection failed', {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Helper function to get connection state string
function getConnectionState(state: number): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };
  return states[state] || 'unknown';
}

// Export connection status checker
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};


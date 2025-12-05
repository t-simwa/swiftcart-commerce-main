import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';
import { env } from './env';

let redisClient: RedisClientType | null = null;
let reconnectAttempts = 0;
let hasLoggedInitialError = false;

export const connectRedis = async (): Promise<void> => {
  try {
    // Create Redis client
    redisClient = createClient({
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        reconnectStrategy: (retries) => {
          reconnectAttempts = retries;
          
          // Fail fast if Redis is clearly not available (after 3 attempts)
          if (retries > 3) {
            if (!hasLoggedInitialError) {
              logger.warn('Redis server not available, disabling Redis caching', {
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
              });
              console.log('⚠️ Redis server not available - application will continue without caching');
              hasLoggedInitialError = true;
            }
            // Stop reconnecting
            return false;
          }
          
          // Exponential backoff: 100ms, 200ms, 400ms
          return Math.min(retries * 100, 1000);
        },
        connectTimeout: 5000, // 5 second timeout
      },
      password: env.REDIS_PASSWORD || undefined,
    });

    // Error handling - only log first error, suppress reconnection errors
    redisClient.on('error', (err) => {
      // Only log the first error, suppress subsequent reconnection errors
      if (!hasLoggedInitialError) {
        logger.warn('Redis connection error (Redis is optional)', {
          error: err.message,
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
        });
        hasLoggedInitialError = true;
      }
    });

    redisClient.on('connect', () => {
      // Reset error flag on successful connection
      hasLoggedInitialError = false;
      reconnectAttempts = 0;
      logger.info('Redis client connecting...');
      console.log('🔄 Redis client connecting...');
    });

    redisClient.on('ready', () => {
      // Reset error flag on ready
      hasLoggedInitialError = false;
      reconnectAttempts = 0;
      logger.info('Redis client ready', {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      });
      console.log(`✅ Redis Connected: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
    });

    redisClient.on('reconnecting', () => {
      // Suppress reconnecting logs after first error
      if (!hasLoggedInitialError && reconnectAttempts <= 1) {
        logger.debug('Redis client reconnecting...');
      }
    });

    redisClient.on('end', () => {
      logger.debug('Redis connection ended');
    });

    // Connect to Redis with timeout
    try {
      await Promise.race([
        redisClient.connect(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        ),
      ]);

      // Test connection
      await redisClient.ping();
      logger.info('Redis connection test successful');
      hasLoggedInitialError = false;
      reconnectAttempts = 0;
    } catch (connectError: any) {
      // Connection failed or timed out
      if (redisClient) {
        try {
          await redisClient.quit();
        } catch {
          // Ignore quit errors
        }
      }
      redisClient = null;
      throw connectError;
    }
  } catch (error: any) {
    // Only log if we haven't already logged an error
    if (!hasLoggedInitialError) {
      logger.warn('Redis connection failed (Redis is optional)', {
        error: error.message,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      });
      console.log('⚠️ Redis not available - application will continue without caching');
      hasLoggedInitialError = true;
    }
    redisClient = null;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
      console.log('✅ Redis connection closed');
    } catch (error: any) {
      logger.error('Error closing Redis connection', {
        error: error.message,
      });
      console.error('❌ Error closing Redis connection:', error.message);
    }
    redisClient = null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const isRedisConnected = (): boolean => {
  return redisClient !== null && redisClient.isReady;
};


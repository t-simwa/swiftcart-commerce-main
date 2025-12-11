import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../utils/cache';
import logger from '../utils/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Cache key prefix
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Middleware to cache API responses
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 3600, prefix = 'api', keyGenerator } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `${prefix}:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const cached = await getCache<any>(cacheKey);
      if (cached) {
        logger.debug('Cache hit', { cacheKey, url: req.originalUrl });
        return res.status(cached.status || 200).json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (body: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, body, { ttl, prefix }).catch((error) => {
            logger.error('Error caching response', {
              error: error.message,
              cacheKey,
            });
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error: any) {
      logger.error('Cache middleware error', {
        error: error.message,
        url: req.originalUrl,
      });
      // Continue without caching on error
      next();
    }
  };
};




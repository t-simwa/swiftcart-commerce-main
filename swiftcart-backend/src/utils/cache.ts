import { getRedisClient, isRedisConnected } from '../config/redis';
import logger from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
  prefix?: string; // Key prefix
}

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Get value from cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const client = getRedisClient();
    if (!client) return null;

    const value = await client.get(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error: any) {
    logger.error('Cache get error', {
      key,
      error: error.message,
    });
    return null;
  }
};

/**
 * Set value in cache
 */
export const setCache = async (
  key: string,
  value: any,
  options: CacheOptions = {}
): Promise<boolean> => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const client = getRedisClient();
    if (!client) return false;

    const ttl = options.ttl || DEFAULT_TTL;
    const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
    const serializedValue = JSON.stringify(value);

    await client.setEx(fullKey, ttl, serializedValue);
    return true;
  } catch (error: any) {
    logger.error('Cache set error', {
      key,
      error: error.message,
    });
    return false;
  }
};

/**
 * Delete value from cache
 */
export const deleteCache = async (key: string, prefix?: string): Promise<boolean> => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const client = getRedisClient();
    if (!client) return false;

    const fullKey = prefix ? `${prefix}:${key}` : key;
    await client.del(fullKey);
    return true;
  } catch (error: any) {
    logger.error('Cache delete error', {
      key,
      error: error.message,
    });
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 */
export const deleteCachePattern = async (pattern: string): Promise<number> => {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const client = getRedisClient();
    if (!client) return 0;

    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await client.del(keys);
    logger.info('Cache pattern deleted', {
      pattern,
      count: deleted,
    });
    return deleted;
  } catch (error: any) {
    logger.error('Cache pattern delete error', {
      pattern,
      error: error.message,
    });
    return 0;
  }
};

/**
 * Clear all cache (use with caution)
 */
export const clearCache = async (): Promise<boolean> => {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const client = getRedisClient();
    if (!client) return false;

    await client.flushDb();
    logger.warn('Cache cleared');
    return true;
  } catch (error: any) {
    logger.error('Cache clear error', {
      error: error.message,
    });
    return false;
  }
};

/**
 * Cache key generators
 */
export const cacheKeys = {
  product: (slug: string) => `product:${slug}`,
  products: (params: string) => `products:${params}`,
  user: (id: string) => `user:${id}`,
  order: (id: string) => `order:${id}`,
  userOrders: (userId: string, params?: string) => 
    `user:${userId}:orders${params ? `:${params}` : ''}`,
  transaction: (txnRef: string) => `transaction:${txnRef}`,
  reviews: (productId: string) => `reviews:${productId}`,
};

/**
 * Helper to wrap async functions with cache
 */
export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    logger.debug('Cache hit', { key });
    return cached;
  }

  // Cache miss, execute function
  logger.debug('Cache miss', { key });
  const result = await fn();

  // Store in cache
  await setCache(key, result, options);

  return result;
};


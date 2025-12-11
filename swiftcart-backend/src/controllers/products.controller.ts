import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { getCache, setCache, cacheKeys } from '../utils/cache';

interface QueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  brands?: string; // Comma-separated list of brands
}

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Query parameters are already validated and transformed by middleware
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sort = 'newest',
      minPrice,
      maxPrice,
      featured,
      brands,
    } = req.query;

    logger.info('Fetching products', { page, limit, category, search, sort });

    // Generate cache key
    const cacheKey = cacheKeys.products(
      JSON.stringify({ page, limit, category, search, sort, minPrice, maxPrice, featured, brands })
    );

    // Try to get from cache
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      logger.debug('Products cache hit', { cacheKey });
      res.status(200).json(cached);
      return;
    }

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.price.$lte = maxPrice;
      }
    }

    if (featured === true) {
      query.featured = true;
    }

    // Filter by brands - brands are in the product name (e.g., "Apple iPhone 15 Pro")
    if (brands) {
      const brandList = brands.split(',').map((b: string) => b.trim()).filter(Boolean);
      if (brandList.length > 0) {
        // Match products where the name starts with any of the selected brands
        // Escape special regex characters and match at the start of the name
        const brandConditions = brandList.map((brand: string) => {
          // Escape special regex characters
          const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Match brand at the start of the product name (case-insensitive)
          // Use space or end of string after brand to avoid partial matches
          return {
            name: { $regex: `^${escapedBrand}(\\s|$)`, $options: 'i' }
          };
        });
        
        // If we have $text search, we need to use $and to combine it with $or
        // Otherwise, MongoDB automatically ANDs all conditions
        if (query.$text) {
          const textQuery = query.$text;
          delete query.$text;
          query.$and = [
            { $text: textQuery },
            { $or: brandConditions }
          ];
        } else {
          query.$or = brandConditions;
        }
      }
    }

    // Build sort
    let sortOption: any = { createdAt: -1 }; // Default: newest first

    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { reviewCount: -1, rating: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info('Products fetched successfully', { count: products.length, total });

    const response = {
      success: true,
      status: 200,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };

    // Cache the response (5 minutes TTL for product lists)
    await setCache(cacheKey, response, { ttl: 300, prefix: 'products' });

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error fetching products', { error: error.message, stack: error.stack });
    next(createError(error.message, 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Get single product by slug
 * @route   GET /api/v1/products/:slug
 * @access  Public
 */
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Slug parameter is already validated by middleware
    const { slug } = req.params;

    logger.info('Fetching product by slug', { slug });

    // Try to get from cache
    const cacheKey = cacheKeys.product(slug);
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      logger.debug('Product cache hit', { slug });
      res.status(200).json(cached);
      return;
    }

    const product = await Product.findOne({ slug }).lean();

    if (!product) {
      logger.warn('Product not found', { slug });
      return next(createError('Product not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    logger.info('Product fetched successfully', { slug, productId: product._id });

    const response = {
      success: true,
      status: 200,
      data: {
        product,
      },
    };

    // Cache the response (1 hour TTL for individual products)
    await setCache(cacheKey, response, { ttl: 3600, prefix: 'product' });

    res.status(200).json(response);
  } catch (error: any) {
    logger.error('Error fetching product by slug', { error: error.message, stack: error.stack });
    next(createError(error.message, 500, 'SERVER_ERROR'));
  }
};


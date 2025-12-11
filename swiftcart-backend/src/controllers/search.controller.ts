import { Request, Response, NextFunction } from 'express';
import { searchProducts, SearchParams } from '../services/searchService';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { Product } from '../models/Product';

interface SearchQueryParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  brands?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'relevance';
}

/**
 * @desc    Search products
 * @route   GET /api/v1/search
 * @access  Public
 */
export const search = async (
  req: Request<{}, {}, {}, SearchQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      featured,
      brands,
      page = 1,
      limit = 20,
      sort = 'relevance',
    } = req.query;

    logger.info('Search request', {
      query: q,
      category,
      page,
      limit,
      sort,
    });

    const searchParams: SearchParams = {
      query: q,
      category,
      minPrice,
      maxPrice,
      featured: featured === true || featured === 'true',
      brands: brands ? brands.split(',').map((b) => b.trim()).filter(Boolean) : undefined,
      page,
      limit,
      sort,
    };

    const result = await searchProducts(searchParams);

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        products: result.products,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
        query: q,
      },
    });
  } catch (error: any) {
    logger.error('Error in search', {
      error: error.message,
      stack: error.stack,
    });
    next(createError(error.message, 500, 'SEARCH_ERROR'));
  }
};

/**
 * @desc    Get search suggestions/autocomplete
 * @route   GET /api/v1/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = async (
  req: Request<{}, {}, {}, { q?: string; limit?: number; category?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, limit = 5, category } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: {
          suggestions: [],
          products: [],
        },
      });
    }

    const query = q.trim();

    // Build search query - match query in name, description, or category
    const orConditions = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ];

    // Build final query
    const searchQuery: any = {};
    
    if (category && category !== 'all') {
      // If category filter is provided, use $and to combine search with category filter
      searchQuery.$and = [
        { $or: orConditions },
        { category: { $regex: category, $options: 'i' } },
      ];
    } else {
      // No category filter, just use $or
      searchQuery.$or = orConditions;
    }

    // Search for products matching the query
    const products = await Product.find(searchQuery)
      .select('name slug image price category')
      .limit(limit)
      .lean();

    // Extract unique suggestions from product names and categories
    const suggestions = new Set<string>();
    
    products.forEach((product) => {
      // Add product name if it contains the query
      if (product.name.toLowerCase().includes(query.toLowerCase())) {
        const words = product.name.split(' ');
        words.forEach((word) => {
          if (word.toLowerCase().startsWith(query.toLowerCase()) && word.length > query.length) {
            suggestions.add(word);
          }
        });
      }
      // Add category
      if (product.category) {
        suggestions.add(product.category);
      }
    });

    // Convert to array and limit
    const suggestionsArray = Array.from(suggestions).slice(0, limit);

    logger.debug('Search suggestions generated', {
      query,
      suggestionsCount: suggestionsArray.length,
      productsCount: products.length,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        suggestions: suggestionsArray,
        products: products.map((p) => ({
          name: p.name,
          slug: p.slug,
          image: p.image,
          price: p.price,
          category: p.category,
        })),
      },
    });
  } catch (error: any) {
    logger.error('Error getting search suggestions', {
      error: error.message,
      stack: error.stack,
    });
    next(createError(error.message, 500, 'SEARCH_SUGGESTIONS_ERROR'));
  }
};

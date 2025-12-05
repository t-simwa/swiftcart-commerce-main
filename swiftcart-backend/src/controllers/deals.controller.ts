import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

interface DealsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  minDiscount?: number;
  maxDiscount?: number;
  minPrice?: number;
  maxPrice?: number;
  dealType?: 'limited-time' | 'lightning' | 'regular';
  sort?: 'newest' | 'discount-desc' | 'price-asc' | 'price-desc';
}

/**
 * @desc    Get today's deals (products with discounts)
 * @route   GET /api/v1/deals
 * @access  Public
 */
export const getDeals = async (
  req: Request<{}, {}, {}, DealsQueryParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minDiscount,
      maxDiscount,
      minPrice,
      maxPrice,
      dealType,
      sort = 'newest',
    } = req.query;

    logger.info('Fetching deals', {
      page,
      limit,
      category,
      minDiscount,
      maxDiscount,
      sort,
    });

    const skip = (page - 1) * limit;

    // Build query - only products with originalPrice > price (discounted)
    const query: any = {
      originalPrice: { $exists: true, $ne: null },
      $expr: { $gt: ['$originalPrice', '$price'] },
    };

    if (category) {
      query.category = { $regex: category, $options: 'i' };
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

    // Calculate discount percentage and filter
    if (minDiscount !== undefined || maxDiscount !== undefined) {
      // We'll filter after fetching since discount is calculated
      // For now, we'll fetch all deals and filter in memory
      // In production, consider using aggregation pipeline
    }

    // Build sort
    let sortOption: any = { createdAt: -1 }; // Default: newest first

    switch (sort) {
      case 'discount-desc':
        // Sort by discount percentage (descending)
        // This requires aggregation, but for now we'll sort in memory
        sortOption = { createdAt: -1 };
        break;
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute query
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit * 2) // Fetch more to account for discount filtering
      .lean();

    // Calculate discount percentage and filter
    let deals = products.map((product: any) => {
      const discount = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
      return {
        ...product,
        discountPercentage: discount,
      };
    });

    // Filter by discount percentage if specified
    if (minDiscount !== undefined) {
      deals = deals.filter((deal: any) => deal.discountPercentage >= minDiscount);
    }
    if (maxDiscount !== undefined) {
      deals = deals.filter((deal: any) => deal.discountPercentage <= maxDiscount);
    }

    // Sort by discount if requested
    if (sort === 'discount-desc') {
      deals.sort((a: any, b: any) => b.discountPercentage - a.discountPercentage);
    }

    // Limit to requested amount
    deals = deals.slice(0, limit);

    // Count total (approximate - in production use aggregation)
    const total = await Product.countDocuments(query);

    const totalPages = Math.ceil(total / limit);

    logger.info('Deals fetched successfully', { count: deals.length, total });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        products: deals,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error fetching deals', { error: error.message, stack: error.stack });
    next(createError(error.message, 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Get featured deals for hero carousel
 * @route   GET /api/v1/deals/hero
 * @access  Public
 */
export const getHeroDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('Fetching hero deals');

    const query: any = {
      originalPrice: { $exists: true, $ne: null },
      $expr: { $gt: ['$originalPrice', '$price'] },
      featured: true, // Prefer featured products
    };

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const deals = products.map((product: any) => {
      const discount = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
      return {
        ...product,
        discountPercentage: discount,
      };
    });

    // Sort by discount percentage (highest first)
    deals.sort((a: any, b: any) => b.discountPercentage - a.discountPercentage);

    logger.info('Hero deals fetched successfully', { count: deals.length });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        products: deals,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching hero deals', { error: error.message, stack: error.stack });
    next(createError(error.message, 500, 'SERVER_ERROR'));
  }
};

/**
 * @desc    Get category offers for "Can't-miss offers" section
 * @route   GET /api/v1/deals/category-offers
 * @access  Public
 */
export const getCategoryOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('Fetching category offers');

    // Return predefined category offers
    // In production, these could be stored in database
    const categoryOffers = [
      {
        id: 'beauty-under-25',
        title: 'Beauty under $25',
        image: 'https://via.placeholder.com/240x224?text=Beauty',
        link: '/deals?category=beauty&maxPrice=25',
      },
      {
        id: 'save-on-outlet',
        title: 'Save on outlet',
        image: 'https://via.placeholder.com/240x224?text=Outlet',
        link: '/deals?tab=outlet',
      },
      {
        id: 'home-25-off',
        title: '25% off or more on home',
        image: 'https://via.placeholder.com/240x224?text=Home',
        link: '/deals?category=home&minDiscount=25',
      },
      {
        id: 'lightning-50-off',
        title: 'Lightning deals over 50% off',
        image: 'https://via.placeholder.com/240x224?text=Lightning',
        link: '/deals?dealType=lightning&minDiscount=50',
      },
      {
        id: 'fitness-under-20',
        title: 'Fitness deals under $20',
        image: 'https://via.placeholder.com/240x224?text=Fitness',
        link: '/deals?category=sports&maxPrice=20',
      },
      {
        id: 'electronics-25-off',
        title: 'Over 25% off electronics',
        image: 'https://via.placeholder.com/240x224?text=Electronics',
        link: '/deals?category=electronics&minDiscount=25',
      },
    ];

    logger.info('Category offers fetched successfully', { count: categoryOffers.length });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        offers: categoryOffers,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching category offers', { error: error.message, stack: error.stack });
    next(createError(error.message, 500, 'SERVER_ERROR'));
  }
};


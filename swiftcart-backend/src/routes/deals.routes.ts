import { Router } from 'express';
import { getDeals, getHeroDeals, getCategoryOffers } from '../controllers/deals.controller';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

/**
 * @route   GET /api/v1/deals
 * @desc    Get all deals with filtering, sorting, and pagination
 * @access  Public
 */
router.get(
  '/',
  validate({
    query: z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
      category: z.string().optional(),
      minDiscount: z.string().regex(/^\d+$/).transform(Number).optional(),
      maxDiscount: z.string().regex(/^\d+$/).transform(Number).optional(),
      minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      dealType: z.enum(['limited-time', 'lightning', 'regular']).optional(),
      sort: z.enum(['newest', 'discount-desc', 'price-asc', 'price-desc']).optional().default('newest'),
    }),
  }),
  getDeals
);

/**
 * @route   GET /api/v1/deals/hero
 * @desc    Get featured deals for hero carousel
 * @access  Public
 */
router.get('/hero', getHeroDeals);

/**
 * @route   GET /api/v1/deals/category-offers
 * @desc    Get category offers for "Can't-miss offers" section
 * @access  Public
 */
router.get('/category-offers', getCategoryOffers);

export default router;


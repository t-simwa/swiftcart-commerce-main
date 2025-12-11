import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { search, getSearchSuggestions } from '../controllers/search.controller';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router: RouterType = Router();

/**
 * @route   GET /api/v1/search
 * @desc    Search products
 * @access  Public
 */
router.get(
  '/',
  validate({
    query: z.object({
      q: z.string().optional(),
      category: z.string().optional(),
      minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      featured: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
      brands: z.string().optional(), // Comma-separated list of brands
      page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
      sort: z.enum(['newest', 'price-asc', 'price-desc', 'popular', 'relevance']).optional().default('relevance'),
    }),
  }),
  search
);

/**
 * @route   GET /api/v1/search/suggestions
 * @desc    Get search suggestions/autocomplete
 * @access  Public
 */
router.get(
  '/suggestions',
  validate({
    query: z.object({
      q: z.string().optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional().default('5'),
      category: z.string().optional(),
    }),
  }),
  getSearchSuggestions
);

export default router;




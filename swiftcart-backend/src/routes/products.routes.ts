import { Router } from 'express';
import { getProducts, getProductBySlug } from '../controllers/products.controller';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get(
  '/',
  validate({
    query: z.object({
      page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
      limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
      category: z.string().optional(),
      search: z.string().optional(),
      sort: z.enum(['newest', 'price-asc', 'price-desc', 'popular']).optional().default('newest'),
      minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
      featured: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    }),
  }),
  getProducts
);

/**
 * @route   GET /api/v1/products/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
router.get(
  '/:slug',
  validate({
    params: z.object({
      slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    }),
  }),
  getProductBySlug
);

export default router;


import { Router } from 'express';
import { getProducts, getProductBySlug } from '../controllers/products.controller';

const router = Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering, sorting, and pagination
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/v1/products/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
router.get('/:slug', getProductBySlug);

export default router;


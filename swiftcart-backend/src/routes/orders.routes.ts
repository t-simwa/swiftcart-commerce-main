import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { validate, commonSchemas } from '../middleware/validation';
import { protect } from '../middleware/auth';
import { checkoutLimiter } from '../middleware/rateLimiter';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/orders.controller';

const router: RouterType = Router();

// Validation schemas
const createOrderSchema = {
  body: z.object({
    items: z
      .array(
        z.object({
          productId: commonSchemas.mongoId,
          quantity: z.number().int().positive().min(1),
        })
      )
      .min(1, 'Order must have at least one item'),
    shippingAddress: z.object({
      street: z.string().min(5).max(200),
      city: z.string().min(2).max(100),
      state: z.string().min(2).max(100),
      zipCode: z.string().min(3).max(20),
      country: z.string().min(2).max(100),
    }),
    notes: z.string().max(500).optional(),
  }),
};

const getOrdersQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    status: z
      .enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .optional(),
  }),
};

const orderIdParamSchema = {
  params: z.object({
    orderId: commonSchemas.mongoId,
  }),
};

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post(
  '/',
  protect,
  checkoutLimiter,
  validate(createOrderSchema),
  createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', protect, validate(getOrdersQuerySchema), getMyOrders);

/**
 * @route   GET /api/v1/orders/:orderId
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:orderId', protect, validate(orderIdParamSchema), getOrderById);

/**
 * @route   PATCH /api/v1/orders/:orderId/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.patch(
  '/:orderId/cancel',
  protect,
  validate(orderIdParamSchema),
  cancelOrder
);

export default router;


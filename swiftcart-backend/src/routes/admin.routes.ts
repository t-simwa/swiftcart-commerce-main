import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { validate, commonSchemas } from '../middleware/validation';
import { protect, authorize } from '../middleware/auth';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalytics,
  getAllUsers,
  updateUserRole,
  getInventory,
} from '../controllers/admin.controller';

const router: RouterType = Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Validation schemas
const updateOrderStatusSchema = {
  params: z.object({
    orderId: commonSchemas.mongoId,
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  }),
};

const getOrdersQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    search: z.string().optional(),
  }),
};

const orderIdParamSchema = {
  params: z.object({
    orderId: commonSchemas.mongoId,
  }),
};

const getProductsQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStock: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  }),
};

const createProductSchema = {
  body: z.object({
    name: z.string().min(1).max(200),
    slug: z.string().optional(),
    description: z.string().min(1),
    price: z.number().min(0),
    originalPrice: z.number().min(0).optional(),
    category: z.string().min(1),
    image: z.string().url(),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0).optional().default(10),
    sku: z.string().min(1).max(50),
    variants: z.array(z.any()).optional(),
    featured: z.boolean().optional().default(false),
  }),
};

const updateProductSchema = {
  params: z.object({
    productId: commonSchemas.mongoId,
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    category: z.string().min(1).optional(),
    image: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    sku: z.string().min(1).max(50).optional(),
    variants: z.array(z.any()).optional(),
    featured: z.boolean().optional(),
  }),
};

const productIdParamSchema = {
  params: z.object({
    productId: commonSchemas.mongoId,
  }),
};

const getAnalyticsQuerySchema = {
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

const getUsersQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
    role: z.enum(['customer', 'admin']).optional(),
    search: z.string().optional(),
  }),
};

const updateUserRoleSchema = {
  params: z.object({
    userId: commonSchemas.mongoId,
  }),
  body: z.object({
    role: z.enum(['customer', 'admin']),
  }),
};

const userIdParamSchema = {
  params: z.object({
    userId: commonSchemas.mongoId,
  }),
};

const getInventoryQuerySchema = {
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('50'),
    lowStockOnly: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
  }),
};

/**
 * @route   GET /api/v1/admin/orders
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
router.get('/orders', validate(getOrdersQuerySchema), getAllOrders);

/**
 * @route   GET /api/v1/admin/orders/:orderId
 * @desc    Get single order by ID (admin only)
 * @access  Private/Admin
 */
router.get('/orders/:orderId', validate(orderIdParamSchema), getOrderById);

/**
 * @route   PATCH /api/v1/admin/orders/:orderId/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
router.patch('/orders/:orderId/status', validate(updateOrderStatusSchema), updateOrderStatus);

/**
 * @route   GET /api/v1/admin/products
 * @desc    Get all products (admin only)
 * @access  Private/Admin
 */
router.get('/products', validate(getProductsQuerySchema), getAllProducts);

/**
 * @route   POST /api/v1/admin/products
 * @desc    Create a new product (admin only)
 * @access  Private/Admin
 */
router.post('/products', validate(createProductSchema), createProduct);

/**
 * @route   PATCH /api/v1/admin/products/:productId
 * @desc    Update a product (admin only)
 * @access  Private/Admin
 */
router.patch('/products/:productId', validate(updateProductSchema), updateProduct);

/**
 * @route   DELETE /api/v1/admin/products/:productId
 * @desc    Delete a product (admin only)
 * @access  Private/Admin
 */
router.delete('/products/:productId', validate(productIdParamSchema), deleteProduct);

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get analytics data (admin only)
 * @access  Private/Admin
 */
router.get('/analytics', validate(getAnalyticsQuerySchema), getAnalytics);

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/users', validate(getUsersQuerySchema), getAllUsers);

/**
 * @route   PATCH /api/v1/admin/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
router.patch('/users/:userId/role', validate(updateUserRoleSchema), updateUserRole);

/**
 * @route   GET /api/v1/admin/inventory
 * @desc    Get inventory data with low stock alerts (admin only)
 * @access  Private/Admin
 */
router.get('/inventory', validate(getInventoryQuerySchema), getInventory);

export default router;


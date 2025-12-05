import { Router } from 'express';
import productRoutes from './products.routes';
import authRoutes from './auth.routes';
import orderRoutes from './orders.routes';
import paymentRoutes from './payment.routes';
import { env } from '../config/env';

const router = Router();
const apiVersion = env.API_VERSION;

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 200,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: apiVersion,
  });
});

// API routes
router.use(`/${apiVersion}/products`, productRoutes);
router.use(`/${apiVersion}/auth`, authRoutes);
router.use(`/${apiVersion}/orders`, orderRoutes);
router.use(`/${apiVersion}/payment`, paymentRoutes);

// Placeholder routes for future implementation
// router.use(`/${apiVersion}/cart`, cartRoutes);
// router.use(`/${apiVersion}/admin`, adminRoutes);

export default router;


import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { z } from 'zod';
import { validate, commonSchemas } from '../middleware/validation';
import { protect } from '../middleware/auth';
import { checkoutLimiter } from '../middleware/rateLimiter';
import {
  initiatePayment,
  handleMpesaCallback,
  getTransactionStatus,
  getOrderPaymentStatus,
} from '../controllers/payment.controller';

const router: RouterType = Router();

// Validation schemas
const initiatePaymentSchema = {
  body: z.object({
    orderId: commonSchemas.mongoId,
    gateway: z.enum(['mpesa', 'card', 'bank']).default('mpesa'),
    phoneNumber: z.string().min(10).max(15).optional(),
  }),
};

const transactionIdParamSchema = {
  params: z.object({
    transactionId: commonSchemas.mongoId,
  }),
};

const orderIdParamSchema = {
  params: z.object({
    orderId: commonSchemas.mongoId,
  }),
};

/**
 * @route   POST /api/v1/payment/initiate
 * @desc    Initiate payment for an order
 * @access  Private
 */
router.post(
  '/initiate',
  protect,
  checkoutLimiter,
  validate(initiatePaymentSchema),
  initiatePayment
);

/**
 * @route   POST /api/v1/payment/mpesa/callback
 * @desc    Handle M-Pesa STK Push callback
 * @access  Public (called by M-Pesa)
 */
router.post('/mpesa/callback', handleMpesaCallback);

/**
 * @route   GET /api/v1/payment/transaction/:transactionId
 * @desc    Get transaction status
 * @access  Private
 */
router.get(
  '/transaction/:transactionId',
  protect,
  validate(transactionIdParamSchema),
  getTransactionStatus
);

/**
 * @route   GET /api/v1/payment/order/:orderId/status
 * @desc    Get payment status for an order
 * @access  Private
 */
router.get(
  '/order/:orderId/status',
  protect,
  validate(orderIdParamSchema),
  getOrderPaymentStatus
);

export default router;


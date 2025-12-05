import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';
import { Order } from '../models/Order';
import logger from '../utils/logger';
import { createError } from '../middleware/errorHandler';

/**
 * @route   POST /api/v1/payment/initiate
 * @desc    Initiate payment for an order
 * @access  Private
 */
export const initiatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { orderId, phoneNumber, gateway = 'mpesa' } = req.body;

    // Validate order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Check if order is already paid
    if (order.status !== 'pending') {
      throw createError(
        `Order is already ${order.status}`,
        400,
        'INVALID_ORDER_STATUS'
      );
    }

    // Validate phone number for M-Pesa
    if (gateway === 'mpesa' && !phoneNumber) {
      throw createError('Phone number is required for M-Pesa payment', 400, 'INVALID_INPUT');
    }

    // Process payment based on gateway
    if (gateway === 'mpesa') {
      const result = await paymentService.processMpesaPayment({
        orderId: order._id.toString(),
        amount: order.totalAmount,
        phoneNumber,
        transactionDesc: `Payment for order ${order._id}`,
      });

      logger.info('Payment initiated', {
        orderId: order._id,
        gateway,
        transactionId: result.transaction._id,
      });

      res.status(200).json({
        success: true,
        status: 200,
        data: {
          transaction: result.transaction,
          stkPush: {
            merchantRequestID: result.stkPushResponse.MerchantRequestID,
            checkoutRequestID: result.stkPushResponse.CheckoutRequestID,
            customerMessage: result.stkPushResponse.CustomerMessage,
          },
          message: 'STK Push initiated. Please complete payment on your phone.',
        },
      });
    } else {
      // Other payment gateways can be added here
      throw createError(
        `Payment gateway ${gateway} is not yet supported`,
        400,
        'UNSUPPORTED_GATEWAY'
      );
    }
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/payment/mpesa/callback
 * @desc    Handle M-Pesa STK Push callback
 * @access  Public (called by M-Pesa)
 */
export const handleMpesaCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    logger.info('M-Pesa callback received', {
      body: req.body,
    });

    // Process callback
    const transaction = await paymentService.handleMpesaCallback(req.body);

    // Send acknowledgment to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
    });
  } catch (error: any) {
    logger.error('M-Pesa callback error', {
      error: error.message,
      body: req.body,
    });

    // Still acknowledge to M-Pesa to prevent retries
    res.status(200).json({
      ResultCode: 1,
      ResultDesc: 'Callback processing failed',
    });
  }
};

/**
 * @route   GET /api/v1/payment/transaction/:transactionId
 * @desc    Get transaction status
 * @access  Private
 */
export const getTransactionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { transactionId } = req.params;

    // Get transaction and verify it belongs to user's order
    const transaction = await paymentService.getTransaction(transactionId);
    const order = await Order.findById(transaction.order);

    if (!order || order.user.toString() !== userId) {
      throw createError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    // Verify transaction status (query M-Pesa if pending)
    const verifiedTransaction = await paymentService.verifyTransaction(transactionId);

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        transaction: verifiedTransaction,
        order: {
          id: order._id,
          status: order.status,
          totalAmount: order.totalAmount,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/payment/order/:orderId/status
 * @desc    Get payment status for an order
 * @access  Private
 */
export const getOrderPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { orderId } = req.params;

    // Get order and verify ownership
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate('transactionId');

    if (!order) {
      throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Get transactions for this order
    const transactions = await paymentService.getOrderTransactions(orderId);

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        order: {
          id: order._id,
          status: order.status,
          totalAmount: order.totalAmount,
        },
        transactions,
        latestTransaction: transactions[0] || null,
      },
    });
  } catch (error: any) {
    next(error);
  }
};


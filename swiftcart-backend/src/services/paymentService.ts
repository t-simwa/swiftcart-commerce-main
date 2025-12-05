import { Transaction, ITransaction, TransactionStatus } from '../models/Transaction';
import { Order, IOrder, OrderStatus } from '../models/Order';
import logger from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { mpesaService } from './mpesaService';

export interface CreateTransactionData {
  orderId: string;
  amount: number;
  gateway: 'mpesa' | 'card' | 'bank';
  phoneNumber?: string;
}

export interface ProcessPaymentData {
  orderId: string;
  amount: number;
  phoneNumber: string;
  transactionDesc?: string;
}

/**
 * Payment Service
 * Handles payment processing, transaction management, and order updates
 */
class PaymentService {
  /**
   * Create a new transaction record
   */
  async createTransaction(data: CreateTransactionData): Promise<ITransaction> {
    try {
      // Verify order exists
      const order = await Order.findById(data.orderId);
      if (!order) {
        throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
      }

      // Verify amount matches order total
      if (Math.abs(data.amount - order.totalAmount) > 0.01) {
        throw createError(
          'Payment amount does not match order total',
          400,
          'AMOUNT_MISMATCH'
        );
      }

      // Check if transaction already exists for this order
      const existingTransaction = await Transaction.findOne({
        order: data.orderId,
        status: { $in: ['pending', 'success'] },
      });

      if (existingTransaction) {
        throw createError(
          'A transaction already exists for this order',
          400,
          'TRANSACTION_EXISTS'
        );
      }

      // Create transaction
      const transaction = new Transaction({
        order: data.orderId,
        gateway: data.gateway,
        amount: data.amount,
        status: 'pending',
        phoneNumber: data.phoneNumber,
      });

      await transaction.save();

      logger.info('Transaction created', {
        transactionId: transaction._id,
        orderId: data.orderId,
        amount: data.amount,
        gateway: data.gateway,
      });

      return transaction;
    } catch (error: any) {
      logger.error('Failed to create transaction', {
        error: error.message,
        orderId: data.orderId,
      });
      throw error;
    }
  }

  /**
   * Process M-Pesa payment (initiate STK Push)
   */
  async processMpesaPayment(data: ProcessPaymentData): Promise<{
    transaction: ITransaction;
    stkPushResponse: any;
  }> {
    try {
      // Create transaction record
      const transaction = await this.createTransaction({
        orderId: data.orderId,
        amount: data.amount,
        gateway: 'mpesa',
        phoneNumber: data.phoneNumber,
      });

      // Initiate STK Push
      const stkPushResponse = await mpesaService.initiateSTKPush({
        phoneNumber: data.phoneNumber,
        amount: data.amount,
        accountReference: transaction.txnRef,
        transactionDesc: data.transactionDesc || `Payment for order ${data.orderId}`,
      });

      // Update transaction with checkout request ID
      transaction.mpesaCheckoutRequestId = stkPushResponse.CheckoutRequestID;
      await transaction.save();

      logger.info('M-Pesa payment initiated', {
        transactionId: transaction._id,
        checkoutRequestID: stkPushResponse.CheckoutRequestID,
      });

      return {
        transaction,
        stkPushResponse,
      };
    } catch (error: any) {
      logger.error('Failed to process M-Pesa payment', {
        error: error.message,
        orderId: data.orderId,
      });
      throw error;
    }
  }

  /**
   * Handle M-Pesa callback
   */
  async handleMpesaCallback(callbackData: any): Promise<ITransaction> {
    try {
      const processed = mpesaService.processCallback(callbackData);
      const checkoutRequestID = processed.checkoutRequestID;

      // Find transaction by checkout request ID
      const transaction = await Transaction.findOne({
        mpesaCheckoutRequestId: checkoutRequestID,
      });

      if (!transaction) {
        logger.error('Transaction not found for callback', {
          checkoutRequestID,
        });
        throw createError(
          'Transaction not found',
          404,
          'TRANSACTION_NOT_FOUND'
        );
      }

      // Update transaction status
      if (processed.resultCode === 0) {
        // Payment successful
        transaction.status = 'success';
        transaction.mpesaReceiptNumber = processed.receiptNumber;
        if (processed.phoneNumber) {
          transaction.phoneNumber = processed.phoneNumber;
        }
        transaction.metadata = {
          ...transaction.metadata,
          amount: processed.amount,
          transactionDate: processed.transactionDate,
        };

        // Update order status
        const order = await Order.findById(transaction.order);
        if (order) {
          order.status = 'processing';
          order.transactionId = transaction._id;
          await order.save();

          logger.info('Order updated after successful payment', {
            orderId: order._id,
            transactionId: transaction._id,
          });

          // Emit real-time update via Socket.io
          const { emitOrderStatusUpdate } = await import('./socketEvents');
          emitOrderStatusUpdate(order);
        }
      } else {
        // Payment failed
        transaction.status = 'failed';
        transaction.errorMessage = processed.resultDesc;
      }

      await transaction.save();

      logger.info('M-Pesa callback processed', {
        transactionId: transaction._id,
        status: transaction.status,
        resultCode: processed.resultCode,
      });

      return transaction;
    } catch (error: any) {
      logger.error('Failed to handle M-Pesa callback', {
        error: error.message,
        callbackData,
      });
      throw error;
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(transactionId: string): Promise<ITransaction> {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw createError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    // If transaction is pending and gateway is M-Pesa, query status
    if (transaction.status === 'pending' && transaction.gateway === 'mpesa' && transaction.mpesaCheckoutRequestId) {
      try {
        const queryResult = await mpesaService.querySTKStatus(
          transaction.mpesaCheckoutRequestId
        );

        // Update transaction based on query result
        if (queryResult.ResultCode === 0) {
          // Payment completed
          transaction.status = 'success';
          if (queryResult.ResultDesc) {
            transaction.metadata = {
              ...transaction.metadata,
              queryResult: queryResult.ResultDesc,
            };
          }
        } else {
          // Still pending or failed
          transaction.status = queryResult.ResultCode === '1032' ? 'cancelled' : 'pending';
          transaction.errorMessage = queryResult.ResultDesc;
        }

        await transaction.save();
      } catch (error: any) {
        logger.error('Failed to query STK status', {
          error: error.message,
          transactionId,
        });
        // Don't throw - return current transaction status
      }
    }

    return transaction;
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(transactionId: string): Promise<ITransaction> {
    const transaction = await Transaction.findById(transactionId)
      .populate('order')
      .lean();

    if (!transaction) {
      throw createError('Transaction not found', 404, 'TRANSACTION_NOT_FOUND');
    }

    return transaction as ITransaction;
  }

  /**
   * Get transactions for an order
   */
  async getOrderTransactions(orderId: string): Promise<ITransaction[]> {
    return Transaction.find({ order: orderId }).sort({ createdAt: -1 });
  }
}

export const paymentService = new PaymentService();


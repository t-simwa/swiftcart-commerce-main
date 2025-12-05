import { Request, Response, NextFunction } from 'express';
import { Order, IOrder, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { validateAddress, normalizeAddress } from '../services/addressValidation';
import { paymentService } from '../services/paymentService';
import logger from '../utils/logger';
import { createError } from '../middleware/errorHandler';

/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order
 * @access  Private
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const { items, shippingAddress, notes } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError('Order must have at least one item', 400, 'INVALID_INPUT');
    }

    // Validate and normalize address
    validateAddress(shippingAddress);
    const normalizedAddress = normalizeAddress(shippingAddress);

    // Process items and calculate totals
    let subtotal = 0;
    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      // Validate item structure
      if (!item.productId || !item.quantity || item.quantity < 1) {
        throw createError('Invalid item data', 400, 'INVALID_INPUT');
      }

      // Get product from database
      const product = await Product.findById(item.productId);
      if (!product) {
        throw createError(
          `Product ${item.productId} not found`,
          404,
          'PRODUCT_NOT_FOUND'
        );
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        throw createError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          400,
          'INSUFFICIENT_STOCK',
          { productId: product._id, available: product.stock, requested: item.quantity }
        );
      }

      // Calculate item total
      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      // Add to order items
      orderItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: itemPrice,
        image: product.image,
      });
    }

    // Calculate shipping fee (free shipping over KSh 5,000)
    const shippingFee = subtotal >= 5000 ? 0 : 300; // KSh 300 standard shipping
    const totalAmount = subtotal + shippingFee;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: normalizedAddress,
      subtotal,
      shippingFee,
      totalAmount,
      notes: notes || undefined,
      status: 'pending',
    });

    await order.save();

    // Populate order with product details
    await order.populate('items.productId', 'name image');

    logger.info('Order created', {
      orderId: order._id,
      userId,
      itemCount: orderItems.length,
      totalAmount,
    });

    // Emit real-time order created event via Socket.io
    const { emitOrderCreated } = await import('../services/socketEvents');
    emitOrderCreated(order);

    res.status(201).json({
      success: true,
      status: 201,
      data: {
        order,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/orders
 * @desc    Get user's orders
 * @access  Private
 */
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createError('User not authenticated', 401, 'UNAUTHORIZED');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { user: userId };
    if (status) {
      query.status = status;
    }

    // Get orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'name image slug')
      .populate('transactionId', 'status gateway mpesaReceiptNumber');

    // Get total count
    const total = await Order.countDocuments(query);

    logger.info('Orders fetched', {
      userId,
      count: orders.length,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/orders/:orderId
 * @desc    Get single order by ID
 * @access  Private
 */
export const getOrderById = async (
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

    const order = await Order.findOne({
      _id: orderId,
      user: userId, // Ensure user can only access their own orders
    })
      .populate('items.productId', 'name image slug description')
      .populate('transactionId', 'status gateway mpesaReceiptNumber amount createdAt');

    if (!order) {
      throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    logger.info('Order fetched', {
      orderId: order._id,
      userId,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        order,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/orders/:orderId/cancel
 * @desc    Cancel an order
 * @access  Private
 */
export const cancelOrder = async (
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

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      throw createError('Order is already cancelled', 400, 'INVALID_OPERATION');
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      throw createError(
        'Cannot cancel order that has been shipped or delivered',
        400,
        'INVALID_OPERATION'
      );
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    logger.info('Order cancelled', {
      orderId: order._id,
      userId,
    });

    // Emit real-time update via Socket.io
    const { emitOrderStatusUpdate } = await import('../services/socketEvents');
    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        order,
      },
    });
  } catch (error: any) {
    next(error);
  }
};


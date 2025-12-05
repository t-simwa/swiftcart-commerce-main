import { Request, Response, NextFunction } from 'express';
import { Order, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * @route   GET /api/v1/admin/orders
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as OrderStatus | undefined;
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'items.name': { $regex: search, $options: 'i' } },
        { 'items.sku': { $regex: search, $options: 'i' } },
      ];
    }

    // Get orders with user info
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'email firstName lastName')
      .populate('items.productId', 'name image slug')
      .populate('transactionId', 'status gateway mpesaReceiptNumber');

    // Get total count
    const total = await Order.countDocuments(query);

    logger.info('Admin fetched orders', {
      adminId: req.user?.userId,
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
 * @route   GET /api/v1/admin/orders/:orderId
 * @desc    Get single order by ID (admin only)
 * @access  Private/Admin
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'email firstName lastName phone addresses')
      .populate('items.productId', 'name image slug description')
      .populate('transactionId', 'status gateway mpesaReceiptNumber amount createdAt');

    if (!order) {
      throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    logger.info('Admin fetched order', {
      orderId: order._id,
      adminId: req.user?.userId,
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
 * @route   PATCH /api/v1/admin/orders/:orderId/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      throw createError('Invalid status', 400, 'INVALID_INPUT');
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw createError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Update status
    const oldStatus = order.status;
    order.status = status as OrderStatus;
    await order.save();

    logger.info('Admin updated order status', {
      orderId: order._id,
      adminId: req.user?.userId,
      oldStatus,
      newStatus: status,
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order status updated successfully',
      data: {
        order,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/products
 * @desc    Get all products with admin details (admin only)
 * @access  Private/Admin
 */
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const lowStock = req.query.lowStock === 'true';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (lowStock) {
      query.$expr = {
        $lte: ['$stock', '$lowStockThreshold'],
      };
    }

    // Get products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);

    logger.info('Admin fetched products', {
      adminId: req.user?.userId,
      count: products.length,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        products,
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
 * @route   POST /api/v1/admin/products
 * @desc    Create a new product (admin only)
 * @access  Private/Admin
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productData = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      throw createError('Product with this SKU already exists', 400, 'DUPLICATE_SKU');
    }

    // Create product
    const product = new Product(productData);
    await product.save();

    logger.info('Admin created product', {
      productId: product._id,
      adminId: req.user?.userId,
      sku: product.sku,
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Product created successfully',
      data: {
        product,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      return next(createError('Product with this slug or SKU already exists', 400, 'DUPLICATE_PRODUCT'));
    }
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/admin/products/:productId
 * @desc    Update a product (admin only)
 * @access  Private/Admin
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      throw createError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Update product
    Object.assign(product, updateData);
    await product.save();

    logger.info('Admin updated product', {
      productId: product._id,
      adminId: req.user?.userId,
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Product updated successfully',
      data: {
        product,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(createError('Product with this slug or SKU already exists', 400, 'DUPLICATE_PRODUCT'));
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/admin/products/:productId
 * @desc    Delete a product (admin only)
 * @access  Private/Admin
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      throw createError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    await product.deleteOne();

    logger.info('Admin deleted product', {
      productId,
      adminId: req.user?.userId,
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get analytics data (admin only)
 * @access  Private/Admin
 */
export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    // Total orders
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    // Revenue by day
    const revenueByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      { $limit: 10 },
    ]);

    // Total customers
    const totalCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: {
        $lte: ['$stock', '$lowStockThreshold'],
      },
    })
      .select('name sku stock lowStockThreshold')
      .limit(20)
      .lean();

    const analytics = {
      overview: {
        totalOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalCustomers,
        averageOrderValue: revenueData[0]?.averageOrderValue || 0,
        totalOrdersCount: revenueData[0]?.totalOrders || 0,
      },
      ordersByStatus: ordersByStatus.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      revenueByDay,
      topProducts,
      lowStockProducts: lowStockProducts.length,
      lowStockProductsList: lowStockProducts,
    };

    logger.info('Admin fetched analytics', {
      adminId: req.user?.userId,
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        analytics,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as 'customer' | 'admin' | undefined;
    const search = req.query.search as string | undefined;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // Get users
    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await User.countDocuments(query);

    logger.info('Admin fetched users', {
      adminId: req.user?.userId,
      count: users.length,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        users,
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
 * @route   PATCH /api/v1/admin/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
      throw createError('Invalid role', 400, 'INVALID_INPUT');
    }

    // Prevent admin from changing their own role
    if (userId === req.user?.userId) {
      throw createError('Cannot change your own role', 400, 'INVALID_OPERATION');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    user.role = role;
    await user.save();

    logger.info('Admin updated user role', {
      userId: user._id,
      adminId: req.user?.userId,
      newRole: role,
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User role updated successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/inventory
 * @desc    Get inventory data with low stock alerts (admin only)
 * @access  Private/Admin
 */
export const getInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lowStockOnly = req.query.lowStockOnly === 'true';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (lowStockOnly) {
      query.$expr = {
        $lte: ['$stock', '$lowStockThreshold'],
      };
    }

    // Get products
    const products = await Product.find(query)
      .select('name sku stock lowStockThreshold category price image')
      .sort({ stock: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate inventory stats
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({
      $expr: {
        $lte: ['$stock', '$lowStockThreshold'],
      },
    });
    const outOfStockCount = await Product.countDocuments({ stock: 0 });
    const totalStockValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
    ]);

    const inventory = {
      products,
      stats: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalStockValue: totalStockValue[0]?.totalValue || 0,
      },
      pagination: {
        page,
        limit,
        total: lowStockOnly ? lowStockCount : totalProducts,
        totalPages: Math.ceil((lowStockOnly ? lowStockCount : totalProducts) / limit),
        hasNext: page * limit < (lowStockOnly ? lowStockCount : totalProducts),
        hasPrev: page > 1,
      },
    };

    logger.info('Admin fetched inventory', {
      adminId: req.user?.userId,
      lowStockOnly,
      count: products.length,
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        inventory,
      },
    });
  } catch (error: any) {
    next(error);
  }
};


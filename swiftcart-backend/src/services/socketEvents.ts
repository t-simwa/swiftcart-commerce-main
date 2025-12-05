import { getSocketInstance } from '../config/socket';
import { IOrder, OrderStatus } from '../models/Order';
import { IInventory } from '../models/Inventory';
import logger from '../utils/logger';

/**
 * Emit order status update to user
 */
export const emitOrderStatusUpdate = (order: IOrder) => {
  try {
    const io = getSocketInstance();
    const userId = order.user.toString();

    // Emit to user's private room
    io.to(`user:${userId}`).emit('order:status-updated', {
      orderId: order._id.toString(),
      status: order.status,
      order: {
        _id: order._id,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      timestamp: new Date(),
    });

    logger.debug('Order status update emitted', {
      orderId: order._id.toString(),
      userId,
      status: order.status,
    });

    // Also emit to admin room for admin dashboard updates
    io.to('admin').emit('order:admin-update', {
      orderId: order._id.toString(),
      status: order.status,
      userId,
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Failed to emit order status update', {
      error: error.message,
      orderId: order._id?.toString(),
    });
  }
};

/**
 * Emit order created event
 */
export const emitOrderCreated = (order: IOrder) => {
  try {
    const io = getSocketInstance();
    const userId = order.user.toString();

    // Emit to user
    io.to(`user:${userId}`).emit('order:created', {
      orderId: order._id.toString(),
      order: {
        _id: order._id,
        status: order.status,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      },
      timestamp: new Date(),
    });

    // Emit to admin room
    io.to('admin').emit('order:new', {
      orderId: order._id.toString(),
      userId,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      timestamp: new Date(),
    });

    logger.debug('Order created event emitted', {
      orderId: order._id.toString(),
      userId,
    });
  } catch (error: any) {
    logger.error('Failed to emit order created event', {
      error: error.message,
      orderId: order._id?.toString(),
    });
  }
};

/**
 * Emit inventory update to all connected clients
 */
export const emitInventoryUpdate = (inventory: IInventory) => {
  try {
    const io = getSocketInstance();
    const productId = inventory.product.toString();

    // Emit to all clients (public event - anyone can see inventory updates)
    io.emit('inventory:updated', {
      productId,
      sku: inventory.sku,
      quantity: inventory.quantity,
      available: inventory.quantity - inventory.reserved,
      reserved: inventory.reserved,
      isLowStock: inventory.quantity > 0 && inventory.quantity <= inventory.lowStockThreshold,
      isOutOfStock: inventory.quantity === 0,
      timestamp: new Date(),
    });

    logger.debug('Inventory update emitted', {
      productId,
      sku: inventory.sku,
      quantity: inventory.quantity,
    });

    // Emit low stock alert to admin room
    if (inventory.quantity > 0 && inventory.quantity <= inventory.lowStockThreshold) {
      io.to('admin').emit('inventory:low-stock', {
        productId,
        sku: inventory.sku,
        quantity: inventory.quantity,
        threshold: inventory.lowStockThreshold,
        timestamp: new Date(),
      });
    }

    // Emit out of stock alert to admin room
    if (inventory.quantity === 0) {
      io.to('admin').emit('inventory:out-of-stock', {
        productId,
        sku: inventory.sku,
        timestamp: new Date(),
      });
    }
  } catch (error: any) {
    logger.error('Failed to emit inventory update', {
      error: error.message,
      productId: inventory.product?.toString(),
    });
  }
};

/**
 * Emit notification to user
 */
export const emitNotification = (userId: string, notification: {
  type: 'order' | 'inventory' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: any;
}) => {
  try {
    const io = getSocketInstance();

    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    });

    logger.debug('Notification emitted', { userId, type: notification.type });
  } catch (error: any) {
    logger.error('Failed to emit notification', {
      error: error.message,
      userId,
    });
  }
};

/**
 * Emit admin notification
 */
export const emitAdminNotification = (notification: {
  type: 'order' | 'inventory' | 'system' | 'user';
  title: string;
  message: string;
  data?: any;
}) => {
  try {
    const io = getSocketInstance();

    io.to('admin').emit('admin:notification', {
      ...notification,
      id: `admin-notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    });

    logger.debug('Admin notification emitted', { type: notification.type });
  } catch (error: any) {
    logger.error('Failed to emit admin notification', {
      error: error.message,
    });
  }
};


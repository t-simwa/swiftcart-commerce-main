import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket, initializeSocket, disconnectSocket, updateSocketAuth } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'system' | 'promotion' | 'admin';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, tokens } = useAuth();

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 100)); // Keep last 100 notifications
  }, []);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    try {
      const socket = initializeSocket(tokens.accessToken);

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Socket.io connected for notifications');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket.io disconnected');
      });

      socket.on('connect_error', (error) => {
        setIsConnected(false);
        console.error('Socket connection error:', error);
        // Don't crash the app if socket fails to connect
      });

      // Order events
      socket.on('order:created', (data: any) => {
        const notification: Notification = {
          id: `order-created-${Date.now()}`,
          type: 'order',
          title: 'Order Placed',
          message: `Your order #${data.orderId.slice(-6)} has been placed successfully!`,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          read: false,
        };
        addNotification(notification);
        toast({
          title: 'Order Placed',
          description: notification.message,
        });
      });

      socket.on('order:status-updated', (data: any) => {
        const statusMessages: Record<string, string> = {
          pending: 'is pending',
          processing: 'is being processed',
          shipped: 'has been shipped',
          delivered: 'has been delivered',
          cancelled: 'has been cancelled',
        };

        const notification: Notification = {
          id: `order-status-${data.orderId}-${Date.now()}`,
          type: 'order',
          title: 'Order Status Updated',
          message: `Your order #${data.orderId.slice(-6)} ${statusMessages[data.status] || 'status changed'}`,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          read: false,
        };
        addNotification(notification);
        toast({
          title: 'Order Update',
          description: notification.message,
        });
      });

      // Inventory events
      socket.on('inventory:updated', (data: any) => {
        // Only show notifications for significant changes (low stock, out of stock)
        if (data.isOutOfStock || data.isLowStock) {
          const notification: Notification = {
            id: `inventory-${data.productId}-${Date.now()}`,
            type: 'inventory',
            title: data.isOutOfStock ? 'Out of Stock' : 'Low Stock Alert',
            message: data.isOutOfStock
              ? `Product ${data.sku} is now out of stock`
              : `Product ${data.sku} is running low (${data.quantity} remaining)`,
            data,
            timestamp: new Date(data.timestamp || Date.now()),
            read: false,
          };
          addNotification(notification);
        }
      });

      // General notifications
      socket.on('notification', (data: Notification) => {
        addNotification({
          ...data,
          timestamp: new Date(data.timestamp),
        });
        toast({
          title: data.title,
          description: data.message,
        });
      });

      // Admin notifications
      socket.on('admin:notification', (data: Notification) => {
        addNotification({
          ...data,
          timestamp: new Date(data.timestamp),
        });
        toast({
          title: data.title,
          description: data.message,
        });
      });

      // Admin order events
      socket.on('order:new', (data: any) => {
        const notification: Notification = {
          id: `admin-order-new-${Date.now()}`,
          type: 'admin',
          title: 'New Order',
          message: `New order #${data.orderId.slice(-6)} received (KSh ${data.totalAmount.toLocaleString()})`,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          read: false,
        };
        addNotification(notification);
        toast({
          title: 'New Order',
          description: notification.message,
        });
      });

      socket.on('order:admin-update', (data: any) => {
        const notification: Notification = {
          id: `admin-order-update-${data.orderId}-${Date.now()}`,
          type: 'admin',
          title: 'Order Updated',
          message: `Order #${data.orderId.slice(-6)} status changed to ${data.status}`,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          read: false,
        };
        addNotification(notification);
      });

      socket.on('inventory:low-stock', (data: any) => {
        const notification: Notification = {
          id: `admin-inventory-low-${data.productId}-${Date.now()}`,
          type: 'admin',
          title: 'Low Stock Alert',
          message: `Product ${data.sku} is running low (${data.quantity} remaining)`,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          read: false,
        };
        addNotification(notification);
      });

      socket.on('inventory:out-of-stock', (data: any) => {
        const notification: Notification = {
          id: `admin-inventory-out-${data.productId}-${Date.now()}`,
          type: 'admin',
          title: 'Out of Stock Alert',
          message: `Product ${data.sku} is now out of stock`,
          data,
          timestamp: new Date(data.timestamp || Date.now()),
          read: false,
        };
        addNotification(notification);
        toast({
          title: 'Out of Stock',
          description: notification.message,
        });
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('order:created');
        socket.off('order:status-updated');
        socket.off('inventory:updated');
        socket.off('notification');
        socket.off('admin:notification');
        socket.off('order:new');
        socket.off('order:admin-update');
        socket.off('inventory:low-stock');
        socket.off('inventory:out-of-stock');
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setIsConnected(false);
      // Don't crash the app if socket initialization fails
    }
  }, [isAuthenticated, tokens?.accessToken, addNotification]);

  // Update socket auth when token changes
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      try {
        updateSocketAuth(tokens.accessToken);
      } catch (error) {
        console.error('Failed to update socket auth:', error);
      }
    }
  }, [isAuthenticated, tokens?.accessToken]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}


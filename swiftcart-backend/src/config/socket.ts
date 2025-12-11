import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';
import logger from '../utils/logger';
import { env } from './env';

export interface AuthenticatedSocket extends Socket {
  user?: JWTPayload & { userDoc?: any };
}

/**
 * Socket.io authentication middleware
 */
export const socketAuth = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      // Allow connection but mark as unauthenticated
      // Some events can be public (like product updates)
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        socket.user = {
          ...decoded,
          userDoc: user,
        };
        logger.debug('Socket authenticated', { userId: decoded.userId, email: decoded.email });
      }
    } catch (error: any) {
      // Token invalid, but allow connection for public events
      logger.debug('Socket authentication failed', { error: error.message });
    }

    next();
  } catch (error: any) {
    logger.error('Socket authentication error', { error: error.message });
    next();
  }
};

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HTTPServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // Authentication middleware
  io.use((socket, next) => {
    socketAuth(socket as AuthenticatedSocket, next);
  });

  // Connection handler
  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.user?.userId || 'anonymous';
    logger.info('Socket client connected', { 
      socketId: authSocket.id, 
      userId,
      authenticated: !!authSocket.user 
    });

    // Join user-specific room for private notifications
    if (authSocket.user?.userId) {
      authSocket.join(`user:${authSocket.user.userId}`);
      logger.debug('User joined private room', { userId: authSocket.user.userId });
    }

    // Join admin room if user is admin
    if (authSocket.user?.role === 'admin') {
      authSocket.join('admin');
      logger.debug('Admin joined admin room', { userId: authSocket.user.userId });
    }

    // Handle disconnection
    authSocket.on('disconnect', (reason) => {
      logger.info('Socket client disconnected', { 
        socketId: authSocket.id, 
        userId,
        reason 
      });
    });

    // Handle errors
    authSocket.on('error', (error) => {
      logger.error('Socket error', { 
        socketId: authSocket.id, 
        userId,
        error: error.message 
      });
    });
  });

  logger.info('Socket.io server initialized');
  return io;
};

/**
 * Socket.io instance (will be set after initialization)
 */
export let io: SocketServer | null = null;

/**
 * Set Socket.io instance
 */
export const setSocketInstance = (socketInstance: SocketServer) => {
  io = socketInstance;
};

/**
 * Get Socket.io instance
 */
export const getSocketInstance = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io instance not initialized. Call initializeSocket first.');
  }
  return io;
};


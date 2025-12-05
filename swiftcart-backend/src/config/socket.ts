import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User } from '../models/User';
import logger from '../utils/logger';
import { env } from './env';

export interface AuthenticatedSocket extends SocketServer.Socket {
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
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId || 'anonymous';
    logger.info('Socket client connected', { 
      socketId: socket.id, 
      userId,
      authenticated: !!socket.user 
    });

    // Join user-specific room for private notifications
    if (socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`);
      logger.debug('User joined private room', { userId: socket.user.userId });
    }

    // Join admin room if user is admin
    if (socket.user?.role === 'admin') {
      socket.join('admin');
      logger.debug('Admin joined admin room', { userId: socket.user.userId });
    }

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Socket client disconnected', { 
        socketId: socket.id, 
        userId,
        reason 
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { 
        socketId: socket.id, 
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


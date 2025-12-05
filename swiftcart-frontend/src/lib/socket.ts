import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection
 */
export const initializeSocket = (token?: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: {
      token: token || localStorage.getItem('accessToken') || undefined,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket.io connected', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.io disconnected', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket.io connection error', error.message);
  });

  return socket;
};

/**
 * Get Socket.io instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect Socket.io
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Update Socket.io authentication token
 */
export const updateSocketAuth = (token: string): void => {
  if (socket) {
    socket.auth = { token };
    socket.disconnect();
    socket.connect();
  }
};

export default socket;


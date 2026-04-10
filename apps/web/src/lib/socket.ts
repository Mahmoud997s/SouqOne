import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';
import { API_BASE } from './config';

const API_URL = API_BASE;

let socket: Socket | null = null;

/** Get or create the singleton socket (does NOT auto-connect) */
export function getSocket(): Socket {
  if (!socket) {
    const token = getAuthToken();
    socket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect_error', () => {
      // Refresh token on reconnect attempt
      const freshToken = getAuthToken();
      if (socket && freshToken) {
        socket.auth = { token: freshToken };
      }
    });
  }
  return socket;
}

/** Connect the socket (with fresh token). Idempotent. */
export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    const token = getAuthToken();
    if (!token) return s;
    s.auth = { token };
    s.connect();
  }
  return s;
}

/** Fully disconnect and destroy the socket singleton (use on logout only). */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

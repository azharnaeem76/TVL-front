'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

let globalSocket: Socket | null = null;
let listenerCount = 0;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tvl_token');
}

function getOrCreateSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (globalSocket?.connected) return globalSocket;

  if (globalSocket) {
    globalSocket.disconnect();
  }

  globalSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
  });

  globalSocket.on('connect', () => {
    console.log('[Socket.IO] Connected');
  });

  globalSocket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
  });

  globalSocket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection error:', err.message);
  });

  return globalSocket;
}

/**
 * Hook to access the Socket.IO connection.
 * Manages lifecycle: connects on first mount, disconnects when no components use it.
 */
export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getOrCreateSocket();
    if (!socket) return;

    socketRef.current = socket;
    listenerCount++;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      listenerCount--;

      // Disconnect if no components are using the socket
      if (listenerCount <= 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        listenerCount = 0;
      }
    };
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { socket: socketRef.current, connected, on, emit };
}

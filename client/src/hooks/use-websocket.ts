import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { buildApiUrl } from '@/lib/api-config';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  users?: string[];
}

export function useWebSocket() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user) return;

    // Get token from localStorage (where we store it for cross-origin auth)
    const token = localStorage.getItem('auth_token');

    if (!token) return;

    // Determine WebSocket URL based on environment
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In development, use localhost:3000 for WebSocket, in production use same host
    const wsHost = import.meta.env.DEV ? 'localhost:3000' : window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        attemptReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
    }
  }, [user]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'NEW_MESSAGE':
        queryClient.invalidateQueries({ queryKey: ['my-messages'] });
        queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        break;
      case 'CONNECTED':
        console.log('WebSocket:', message.message);
        break;
      case 'PONG':
        break;
      default:
        console.log('Unknown WebSocket message:', message);
    }
  }, [queryClient]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, connect]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const ping = useCallback(() => {
    sendMessage({ type: 'PING' });
  }, [sendMessage]);

  return { isConnected, sendMessage, ping };
}

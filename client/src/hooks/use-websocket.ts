import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { onMessage, onOpen, onClose, onError } = options;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      onOpen?.();
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ONLINE_USERS') {
          setOnlineUsers(data.users);
        }
        onMessage?.(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      onClose?.();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.current.onerror = (error) => {
      onError?.(error);
    };
  }, [onMessage, onOpen, onClose, onError]);

  const send = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    onlineUsers,
    send,
    disconnect,
    ws: ws.current,
  };
}

export function useTypingIndicator(chatId: string | null) {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const startTyping = useCallback((send: (data: any) => void) => {
    if (!chatId) return;
    send({ type: 'TYPING_START', chatId });
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = setTimeout(() => {
      stopTyping(send);
    }, 3000);
  }, [chatId]);

  const stopTyping = useCallback((send: (data: any) => void) => {
    if (!chatId) return;
    send({ type: 'TYPING_STOP', chatId });
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  }, [chatId]);

  const handleTypingMessage = useCallback((data: any) => {
    if (data.type === 'USER_TYPING' && data.chatId === chatId) {
      setTypingUsers(prev => {
        if (data.isTyping && !prev.includes(data.userId)) {
          return [...prev, data.userId];
        } else if (!data.isTyping) {
          return prev.filter(id => id !== data.userId);
        }
        return prev;
      });
    }
  }, [chatId]);

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    handleTypingMessage,
  };
}

export function useLiveAttendance() {
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  const handleAttendanceMessage = useCallback((data: any) => {
    if (data.type === 'ATTENDANCE_UPDATE') {
      setAttendanceCount(prev => prev + 1);
      setRecentCheckins(prev => [data.data, ...prev].slice(0, 10));
    }
  }, []);

  return {
    attendanceCount,
    recentCheckins,
    handleAttendanceMessage,
  };
}

export function useNotificationsRealtime() {
  const [newNotification, setNewNotification] = useState<any>(null);

  const handleNotificationMessage = useCallback((data: any) => {
    if (data.type === 'NOTIFICATION') {
      setNewNotification(data.data);
    }
  }, []);

  return {
    newNotification,
    handleNotificationMessage,
  };
}

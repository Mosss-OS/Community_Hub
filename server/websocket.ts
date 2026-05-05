import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
  typingIn?: string; // chatId or conversationId where user is typing
}

// JWT secret - must be set via environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const clients = new Map<string, Set<AuthenticatedWebSocket>>();
const typingUsers = new Map<string, { userId: string; timestamp: number }[]>();

export function setupWebSocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
  });

  console.log('WebSocket server setting up...');

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    console.log('WebSocket connection request received');
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      console.log('WebSocket connection rejected: No token provided');
      ws.close(4001, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      ws.userId = decoded.userId;
      ws.isAlive = true;

      if (!clients.has(decoded.userId)) {
        clients.set(decoded.userId, new Set());
      }
      clients.get(decoded.userId)!.add(ws);

      console.log(`WebSocket client connected: ${decoded.userId}`);

      // Notify others user came online
      broadcastToAllExcept(decoded.userId, {
        type: 'USER_ONLINE',
        userId: decoded.userId
      });

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await handleMessage(ws, message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      ws.on('close', () => {
        if (ws.userId && clients.has(ws.userId)) {
          clients.get(ws.userId)!.delete(ws);
          if (clients.get(ws.userId)!.size === 0) {
            clients.delete(ws.userId);
            // Notify others user went offline
            broadcastToAllExcept(ws.userId, {
              type: 'USER_OFFLINE',
              userId: ws.userId
            });
          }
        }
        // Clear typing indicator
        if (ws.typingIn) {
          clearTyping(ws.typingIn, ws.userId!);
        }
        console.log(`WebSocket client disconnected: ${ws.userId}`);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
      });
    } catch (err) {
      ws.close(4001, 'Invalid token');
    }
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (!ws.isAlive) {
        if (ws.userId && clients.has(ws.userId)) {
          clients.get(ws.userId)!.delete(ws);
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Clear stale typing indicators every 10 seconds
  setInterval(() => {
    const now = Date.now();
    typingUsers.forEach((users, chatId) => {
      const filtered = users.filter(u => now - u.timestamp < 5000);
      if (filtered.length !== users.length) {
        typingUsers.set(chatId, filtered);
      }
    });
  }, 10000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('WebSocket server initialized');

  return wss;
}

async function handleMessage(ws: AuthenticatedWebSocket, message: any) {
  const userId = ws.userId!;

  switch (message.type) {
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      break;

    case 'GET_ONLINE_USERS':
      const onlineUsers = Array.from(clients.keys());
      ws.send(JSON.stringify({ type: 'ONLINE_USERS', users: onlineUsers }));
      break;

    case 'TYPING_START':
      if (message.chatId) {
        ws.typingIn = message.chatId;
        addTyping(message.chatId, userId);
        // Broadcast to others in the chat
        broadcastToChat(message.chatId, userId, {
          type: 'USER_TYPING',
          chatId: message.chatId,
          userId: userId,
          isTyping: true
        });
      }
      break;

    case 'TYPING_STOP':
      if (ws.typingIn) {
        clearTyping(ws.typingIn, userId);
        broadcastToChat(ws.typingIn, userId, {
          type: 'USER_TYPING',
          chatId: ws.typingIn,
          userId: userId,
          isTyping: false
        });
        ws.typingIn = undefined;
      }
      break;

    case 'JOIN_CHAT':
      if (message.chatId) {
        ws.typingIn = message.chatId;
        // Send current typing users
        const typing = typingUsers.get(message.chatId) || [];
        ws.send(JSON.stringify({
          type: 'CHAT_TYPING_USERS',
          chatId: message.chatId,
          users: typing.map(u => u.userId)
        }));
      }
      break;

    case 'LEAVE_CHAT':
      if (message.chatId) {
        clearTyping(message.chatId, userId);
        ws.typingIn = undefined;
      }
      break;

    case 'ATTENDANCE_CHECKIN':
      // Broadcast live attendance update to admins
      broadcastToAdmins({
        type: 'ATTENDANCE_UPDATE',
        data: message.data,
        timestamp: Date.now()
      });
      break;

    case 'LIVE_VIEWERS':
      // For live stream viewer count
      broadcastToAdmins({
        type: 'VIEWER_COUNT_UPDATE',
        count: message.count,
        streamId: message.streamId
      });
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

function addTyping(chatId: string, userId: string) {
  if (!typingUsers.has(chatId)) {
    typingUsers.set(chatId, []);
  }
  const users = typingUsers.get(chatId)!;
  if (!users.find(u => u.userId === userId)) {
    users.push({ userId, timestamp: Date.now() });
  }
}

function clearTyping(chatId: string, userId: string) {
  const users = typingUsers.get(chatId);
  if (users) {
    typingUsers.set(chatId, users.filter(u => u.userId !== userId));
  }
}

function broadcastToChat(chatId: string, excludeUserId: string, data: any) {
  // In a real implementation, you'd track which users are in which chat
  // For now, broadcast to all (the client should filter)
  broadcastToAllExcept(excludeUserId, data);
}

function broadcastToAllExcept(excludeUserId: string, data: any) {
  const message = JSON.stringify(data);
  clients.forEach((userClients, userId) => {
    if (userId !== excludeUserId) {
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });
}

function broadcastToAdmins(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((userClients, userId) => {
    userClients.forEach(async (client) => {
      try {
        const user = await storage.getUserById(userId);
        if (user?.isAdmin && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    });
  });
}

export function sendToUser(userId: string, data: any) {
  const userClients = clients.get(userId);
  if (userClients) {
    const message = JSON.stringify(data);
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export function broadcastToAll(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((userClients) => {
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
}

export function sendNewMessageNotification(userId: string, message: any) {
  sendToUser(userId, {
    type: 'NEW_MESSAGE',
    data: message
  });
}

export function sendNotificationToUser(userId: string, notification: any) {
  sendToUser(userId, {
    type: 'NOTIFICATION',
    data: notification
  });
}

export function broadcastAttendanceUpdate(data: any) {
  broadcastToAdmins({
    type: 'ATTENDANCE_UPDATE',
    data,
    timestamp: Date.now()
  });
}

export function getOnlineUsers(): string[] {
  return Array.from(clients.keys());
}

export function isUserOnline(userId: string): boolean {
  return clients.has(userId) && clients.get(userId)!.size > 0;
}

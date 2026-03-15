import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const clients = new Map<string, Set<AuthenticatedWebSocket>>();

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

      ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to WebSocket' }));

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleMessage(ws, message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      ws.on('close', () => {
        if (ws.userId && clients.has(ws.userId)) {
          clients.get(ws.userId)!.delete(ws);
          if (clients.get(ws.userId)!.size === 0) {
            clients.delete(ws.userId);
          }
        }
        console.log(`WebSocket client disconnected: ${ws.userId}`);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
      });

      ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to WCCRM realtime' }));
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

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('WebSocket server initialized');

  return wss;
}

async function handleMessage(ws: AuthenticatedWebSocket, message: any) {
  switch (message.type) {
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG' }));
      break;
    
    case 'GET_ONLINE_USERS':
      const onlineUsers = Array.from(clients.keys());
      ws.send(JSON.stringify({ type: 'ONLINE_USERS', users: onlineUsers }));
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
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

export function broadcastToAdmins(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((userClients, userId) => {
    // We'll check admin status via storage
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

export function sendNewMessageNotification(userId: string, message: any) {
  sendToUser(userId, {
    type: 'NEW_MESSAGE',
    data: message
  });
}

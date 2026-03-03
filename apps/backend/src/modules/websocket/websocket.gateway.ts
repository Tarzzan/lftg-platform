import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ConnectedUser {
  userId: string;
  username: string;
  socketId: string;
  connectedAt: Date;
  rooms: string[];
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId || `anon-${client.id}`;
    const username = client.handshake.auth?.username || 'Anonyme';
    this.connectedUsers.set(client.id, {
      userId,
      username,
      socketId: client.id,
      connectedAt: new Date(),
      rooms: [],
    });
    this.logger.log(`Client connected: ${client.id} (${username})`);
    // Broadcast online users
    this.server.emit('users:online', this.getOnlineUsers());
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.server.emit('users:online', this.getOnlineUsers());
    if (user) {
      user.rooms.forEach(room => {
        this.server.to(room).emit('user:left', { userId: user.userId, username: user.username });
      });
    }
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(data.roomId);
    const user = this.connectedUsers.get(client.id);
    if (user) {
      user.rooms.push(data.roomId);
      this.server.to(data.roomId).emit('user:joined', {
        userId: user.userId,
        username: user.username,
        roomId: data.roomId,
      });
    }
    return { event: 'room:joined', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('room:leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.leave(data.roomId);
    const user = this.connectedUsers.get(client.id);
    if (user) {
      user.rooms = user.rooms.filter(r => r !== data.roomId);
      this.server.to(data.roomId).emit('user:left', {
        userId: user.userId,
        username: user.username,
        roomId: data.roomId,
      });
    }
    return { event: 'room:left', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('message:send')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; attachments?: string[] },
  ) {
    const user = this.connectedUsers.get(client.id);
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId: data.roomId,
      content: data.content,
      attachments: data.attachments || [],
      sender: { userId: user?.userId, username: user?.username },
      timestamp: new Date().toISOString(),
      read: false,
    };
    // Broadcast to room (including sender)
    this.server.to(data.roomId).emit('message:received', message);
    return { event: 'message:sent', data: message };
  }

  @SubscribeMessage('message:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const user = this.connectedUsers.get(client.id);
    client.to(data.roomId).emit('user:typing', {
      userId: user?.userId,
      username: user?.username,
      isTyping: data.isTyping,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('message:read')
  handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; messageId: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    this.server.to(data.roomId).emit('message:read_ack', {
      messageId: data.messageId,
      readBy: user?.userId,
      readAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('notification:send')
  handleNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; type: string; title: string; body: string },
  ) {
    // Find target socket
    for (const [socketId, u] of this.connectedUsers.entries()) {
      if (u.userId === data.targetUserId) {
        this.server.to(socketId).emit('notification:received', {
          id: `notif-${Date.now()}`,
          type: data.type,
          title: data.title,
          body: data.body,
          timestamp: new Date().toISOString(),
          read: false,
        });
        break;
      }
    }
  }

  // Broadcast to all connected clients (called from other services)
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Broadcast to a specific room
  broadcastToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }

  private getOnlineUsers() {
    return Array.from(this.connectedUsers.values()).map(u => ({
      userId: u.userId,
      username: u.username,
      connectedAt: u.connectedAt,
    }));
  }
}

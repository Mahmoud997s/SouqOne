import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ChatService } from './chat.service';
import { RedisService } from '../redis/redis.service';
import { SendMessageDto } from './dto/send-message.dto';
import type { JwtPayload } from '../auth/auth.types';

@SkipThrottle()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    console.log('🔌 ChatGateway initialized');
    // Delay subscription to ensure RedisService is fully initialized
    setTimeout(() => this.subscribeToRedis(), 1000);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      // Manually verify JWT on connection (guards don't run here)
      const user = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      client.data.user = user;

      if (!user) {
        client.disconnect();
        return;
      }

      this.connectedUsers.set(user.sub, client.id);
      await this.redis.set(`user:online:${user.sub}`, client.id, 600);

      console.log(`✅ User ${user.username} connected (${client.id})`);

      // Join user's personal room for notifications
      client.join(`user:${user.sub}`);

      // Auto-join user's active conversations
      const conversations = await this.chatService.getConversations(user.sub);
      for (const conv of conversations) {
        client.join(`conversation:${conv.id}`);
      }

      client.emit('connected', { userId: user.sub, username: user.username });
    } catch (err) {
      console.error('Connection error:', err);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as JwtPayload;
    if (user) {
      this.connectedUsers.delete(user.sub);
      await this.redis.del(`user:online:${user.sub}`);
      console.log(`❌ User ${user.username} disconnected`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    // Verify user is participant
    const participant = await this.chatService['prisma'].conversationParticipant.findFirst({
      where: { conversationId: data.conversationId, userId: user.sub },
    });

    if (!participant) {
      client.emit('error', { message: 'لا يمكنك الانضمام لهذه المحادثة' });
      return;
    }

    client.join(`conversation:${data.conversationId}`);
    client.emit('joined-conversation', { conversationId: data.conversationId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);
    client.emit('left-conversation', { conversationId: data.conversationId });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: string; mediaUrl?: string },
  ) {
    const user = client.data.user as JwtPayload;

    try {
      const dto: SendMessageDto = {
        content: data.content,
        type: data.type as any,
        mediaUrl: data.mediaUrl,
      };

      const message = await this.chatService.sendMessage(data.conversationId, dto, user.sub);

      // Publish to Redis for multi-instance support
      await this.redis.publish('chat:message', {
        conversationId: data.conversationId,
        message,
      });

      return { success: true, message };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'فشل إرسال الرسالة' });
      return { success: false, error: err.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    client.to(`conversation:${data.conversationId}`).emit('user-typing', {
      conversationId: data.conversationId,
      userId: user.sub,
      username: user.username,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('stop-typing')
  async handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    client.to(`conversation:${data.conversationId}`).emit('user-stop-typing', {
      conversationId: data.conversationId,
      userId: user.sub,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark-read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const user = client.data.user as JwtPayload;

    try {
      const result = await this.chatService.markAsRead(data.conversationId, user.sub);

      // Broadcast read receipt to others
      client.to(`conversation:${data.conversationId}`).emit('messages-read', {
        conversationId: data.conversationId,
        userId: user.sub,
        lastReadAt: result.lastReadAt,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    const user = client.data.user as JwtPayload;

    try {
      const result = await this.chatService.deleteMessage(data.messageId, user.sub);

      // Broadcast deletion to conversation room
      this.server.to(`conversation:${result.conversationId}`).emit('message-deleted', {
        messageId: result.messageId,
        conversationId: result.conversationId,
      });

      return { success: true };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'فشل حذف الرسالة' });
      return { success: false, error: err.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('react-to-message')
  async handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    const user = client.data.user as JwtPayload;

    try {
      const result = await this.chatService.toggleReaction(data.messageId, user.sub, data.emoji);

      // Broadcast reaction to conversation room
      this.server.to(`conversation:${result.conversationId}`).emit('message-reaction', {
        messageId: result.messageId,
        emoji: result.emoji,
        action: result.action,
        userId: user.sub,
        username: user.username,
      });

      return { success: true, action: result.action };
    } catch (err: any) {
      client.emit('error', { message: err.message || 'فشل التفاعل' });
      return { success: false, error: err.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket) {
    const user = client.data.user as JwtPayload;
    await this.redis.expire(`user:online:${user.sub}`, 600);
    client.emit('pong');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('check-online')
  async handleCheckOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const online = await this.isUserOnline(data.userId);
    client.emit('online-status', { userId: data.userId, online });
  }

  // Subscribe to Redis Pub/Sub for multi-instance support
  private subscribeToRedis() {
    this.redis.subscribe('chat:message', (data: { conversationId: string; message: any }) => {
      // Emit message to all clients in the conversation room
      this.server.to(`conversation:${data.conversationId}`).emit('message', data.message);
    });
  }

  // Helper method to check if user is online
  async isUserOnline(userId: string): Promise<boolean> {
    return this.redis.exists(`user:online:${userId}`);
  }

  // Send notification via WebSocket if user is online
  async sendNotification(userId: string, notification: any) {
    const isOnline = await this.isUserOnline(userId);
    if (isOnline) {
      this.server.to(`user:${userId}`).emit('notification', notification);
    }
  }
}

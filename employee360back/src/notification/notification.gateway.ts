import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, number> = new Map();
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`✅ Client connecté: ${client.id}`);
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.connectedClients.set(client.id, parseInt(userId, 10));
      client.join(`user-${userId}`);
      this.logger.log(
        `🔗 Client ${client.id} (user ${userId}) a rejoint la room user-${userId}`,
      );
    } else {
      this.logger.warn(`⚠️ Client ${client.id} connecté sans userId.`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    this.logger.log(
      `❌ Client déconnecté: ${client.id}${userId ? ` (user ${userId})` : ''}`,
    );
    this.connectedClients.delete(client.id);
  }

  sendNotificationToUser(userId: number, message: string) {
    const roomName = `user-${userId}`;
    if (this.server.sockets.adapter.rooms.get(roomName)) {
      this.server.to(roomName).emit('newNotification', { message });
      this.logger.log(
        `📩 Notification envoyée à ${roomName} (user ${userId}): ${message}`,
      );
    } else {
      this.logger.error(
        `❌ Room ${roomName} introuvable pour l'utilisateur ${userId}`,
      );
    }
  }

  sendGlobalNotification(message: string) {
    this.server.emit('newGlobalNotification', { message });
    this.logger.log(`🌍 Notification globale envoyée: ${message}`);
  }

  @SubscribeMessage('joinUserRoom')
  async handleJoinRoom(@MessageBody() userId: number, client: Socket) {
    if (!client || !client.id) {
      this.logger.error(
        '❌ client ou client.id est undefined dans handleJoinRoom',
      );
      return;
    }

    if (!userId) {
      this.logger.error('❌ userId est invalide ou undefined');
      return;
    }

    const roomName = `user-${userId}`;

    if (client.rooms.has(roomName)) {
      this.logger.log(
        `🔗 Le client ${client.id} est déjà dans la room ${roomName}`,
      );
    } else {
      client.join(roomName);
      this.logger.log(`🔗 Client ${client.id} a rejoint la room ${roomName}`);
    }

    client.emit('joinedRoom', `Vous avez rejoint la room pour ${roomName}`);
  }

  @SubscribeMessage('sendGlobalNotification')
  async handleGlobalNotification(@MessageBody() message: string) {
    await this.notificationService.notifyAllUsers(message);
  }
}

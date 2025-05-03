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

  private connectedClients: Set<string> = new Set();

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`✅ Client connecté: ${client.id}`);
    if (!client.id) {
      console.error('❌ client.id est undefined lors de la connexion');
      return;
    }
    this.connectedClients.add(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client déconnecté: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  sendNotificationToUser(userId: number, message: string) {
    const roomName = `user-${userId}`;
    if (this.server.sockets.adapter.rooms.get(roomName)) {
      this.server.to(roomName).emit('newNotification', { message });
      console.log(`📩 Notification envoyée à ${roomName}: ${message}`);
    } else {
      console.error(
        `❌ Room ${roomName} introuvable pour l'utilisateur ${userId}`,
      );
    }
  }

  sendGlobalNotification(message: string) {
    this.server.emit('newGlobalNotification', { message });
    console.log(`🌍 Notification globale envoyée: ${message}`);
  }

  @SubscribeMessage('joinUserRoom')
  async handleJoinRoom(@MessageBody() userId: number, client: Socket) {
    if (!client || !client.id) {
      console.error('❌ client ou client.id est undefined dans handleJoinRoom');
      return;
    }

    if (!userId) {
      console.error('❌ userId est invalide ou undefined');
      return;
    }

    const roomName = `user-${userId}`;

    if (client.rooms.has(roomName)) {
      console.log(
        `🔗 Le client ${client.id} est déjà dans la room ${roomName}`,
      );
    } else {
      client.join(roomName);
      console.log(`🔗 Client ${client.id} a rejoint la room ${roomName}`);
    }

    client.emit('joinedRoom', `Vous avez rejoint la room pour ${roomName}`);
  }

  @SubscribeMessage('sendGlobalNotification')
  async handleGlobalNotification(@MessageBody() message: string) {
    await this.notificationService.notifyAllUsers(message);
  }
}

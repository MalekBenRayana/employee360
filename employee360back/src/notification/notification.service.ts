import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../user/user.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async sendNotification(
    message: string,
    userId?: number,
  ): Promise<Notification | Notification[]> {
    if (userId) {
      return this.notifyUser(userId, message);
    } else {
      return this.notifyAllUsers(message);
    }
  }

  // Envoie à un seul utilisateur
  async notifyUser(userId: number, message: string): Promise<Notification> {
    this.logger.log(
      `[NotificationService] notifyUser appelé pour l'utilisateur ${userId} avec le message : ${message}`,
    );

    const user = await this.userRepository.findOneBy({ id: userId });
    this.logger.log(`[NotificationService] Utilisateur trouvé :`, user);
    if (!user) {
      this.logger.error(
        `[NotificationService] Utilisateur avec l'ID ${userId} non trouvé.`,
      );
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const notification = this.notificationRepo.create({
      message,
      recipient: user,
    });
    this.logger.log(`[NotificationService] Notification créée :`, notification);

    const savedNotification = await this.notificationRepo.save(notification);
    this.logger.log(
      `[NotificationService] Notification sauvegardée :`,
      savedNotification,
    );

    this.notificationGateway.sendNotificationToUser(userId, message);

    return savedNotification;
  }

  async notifyAllUsers(message: string): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const users = await this.getAllUsers();

    for (const user of users) {
      const notification = this.notificationRepo.create({
        message,
        recipient: user,
      });

      await this.notificationRepo.save(notification);
      notifications.push(notification);
    }

    this.notificationGateway.sendGlobalNotification(message);

    return notifications;
  }

  private async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
      // Vous pouvez choisir de ne récupérer que les notifications non lues ici si nécessaire
      // where: { recipient: { id: userId }, isRead: false },
      relations: ['recipient'], // Assurez-vous de charger la relation recipient si vous l'utilisez dans votre frontend
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['recipient'],
    }); // Charger la relation si nécessaire

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}

import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../user/user.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
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
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const notification = this.notificationRepo.create({
      message,
      recipient: user,
    });

    const savedNotification = await this.notificationRepo.save(notification);
    this.notificationGateway.sendNotificationToUser(userId, message);

    return savedNotification;
  }

  // Envoie à tous les utilisateurs
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
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOneBy({ id });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}

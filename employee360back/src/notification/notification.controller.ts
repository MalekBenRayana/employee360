import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  async create(@Body() body: { userId?: number; message: string }) {
    const { userId, message } = body;

    if (userId) {
      return this.service.notifyUser(userId, message);
    } else {
      return this.service.notifyAllUsers(message);
    }
  }

  @Get('user/:userId')
  getUserNotifications(@Param('userId') userId: number) {
    return this.service.findByUser(userId);
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: number) {
    return this.service.markAsRead(id);
  }
}

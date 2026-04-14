import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.types';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { PushSubscriptionDto, PushUnsubscribeDto } from './dto/push-subscription.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
  ) {}

  @Get('push/vapid-key')
  getVapidKey() {
    return { key: this.pushService.getPublicKey() };
  }

  @UseGuards(JwtAuthGuard)
  @Post('push/subscribe')
  subscribe(@Body() dto: PushSubscriptionDto, @CurrentUser() user: JwtPayload) {
    return this.pushService.subscribe(user.sub, { endpoint: dto.endpoint, keys: dto.keys });
  }

  @UseGuards(JwtAuthGuard)
  @Post('push/unsubscribe')
  unsubscribe(@Body() dto: PushUnsubscribeDto) {
    return this.pushService.unsubscribe(dto.endpoint);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.findAll(
      user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationsService.markAllAsRead(user.sub);
  }
}

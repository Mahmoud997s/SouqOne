import { Module } from '@nestjs/common';
import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}

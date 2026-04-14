import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ThawaniService } from './thawani.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService, ThawaniService],
  exports: [PaymentsService, ThawaniService],
})
export class PaymentsModule {}

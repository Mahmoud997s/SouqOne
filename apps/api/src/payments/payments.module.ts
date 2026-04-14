import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ThawaniService } from './thawani.service';
import { PaymentsCronService } from './payments-cron.service';
import { PaymentWebhookProcessor, PAYMENT_WEBHOOK_QUEUE } from './payment-webhook.processor';
import { AdminPaymentsController } from './admin-payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({ name: PAYMENT_WEBHOOK_QUEUE }),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService, ThawaniService, PaymentsCronService, PaymentWebhookProcessor],
  exports: [PaymentsService, ThawaniService],
})
export class PaymentsModule {}

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsCronService {
  private readonly logger = new Logger(PaymentsCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStalePendingPayments() {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const result = await this.prisma.payment.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
      },
      data: { status: 'FAILED' },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} stale PENDING payments as FAILED`);
    }
  }
}

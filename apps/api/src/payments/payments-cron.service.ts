import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ThawaniService } from './thawani.service';
import { PaymentsService } from './payments.service';

@Injectable()
export class PaymentsCronService {
  private readonly logger = new Logger(PaymentsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly thawani: ThawaniService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStalePendingPayments() {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const result = await this.prisma.payment.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoff },
        thawaniSessionId: null,
      },
      data: { status: 'FAILED' },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} stale PENDING payments (no session) as FAILED`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async reconcilePayments() {
    this.logger.log('Starting daily payment reconciliation...');

    const pending = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        thawaniSessionId: { not: null },
        createdAt: { lt: new Date(Date.now() - 3600_000) },
      },
      take: 100,
    });

    if (pending.length === 0) {
      this.logger.log('Reconciliation: no pending payments to check');
      return;
    }

    let synced = 0;
    let failed = 0;
    let errors = 0;

    for (const payment of pending) {
      try {
        const session = await this.thawani.getSession(payment.thawaniSessionId!);

        if (session.payment_status === 'paid' && payment.status !== 'PAID') {
          await this.paymentsService.reconcilePayment(payment.id);
          synced++;
          this.logger.log(`Reconciled payment ${payment.id} → PAID`);
        } else if (
          session.payment_status === 'cancelled' ||
          session.payment_status === 'expired'
        ) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
          failed++;
          this.logger.log(`Reconciled payment ${payment.id} → FAILED (${session.payment_status})`);
        }
      } catch (err) {
        errors++;
        this.logger.error(`Reconciliation error for payment ${payment.id}: ${err}`);
      }
    }

    this.logger.log(
      `Reconciliation complete: ${pending.length} checked, ${synced} synced, ${failed} failed, ${errors} errors`,
    );
  }
}

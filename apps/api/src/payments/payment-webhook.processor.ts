import { Process, Processor, OnQueueFailed, InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PaymentsService } from './payments.service';

export const PAYMENT_WEBHOOK_QUEUE = 'payment-webhook';
export const PAYMENT_DLQ = 'payment-dlq';

@Processor(PAYMENT_WEBHOOK_QUEUE)
export class PaymentWebhookProcessor {
  private readonly logger = new Logger(PaymentWebhookProcessor.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    @InjectQueue(PAYMENT_DLQ) private readonly dlq: Queue,
  ) {}

  @Process()
  async handleWebhook(job: Job<{ body: any }>) {
    this.logger.log(`Processing webhook job ${job.id} (attempt ${job.attemptsMade + 1})`);
    try {
      await this.paymentsService.handleWebhook(job.data.body);
      this.logger.log(`Webhook job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Webhook job ${job.id} failed (attempt ${job.attemptsMade + 1}): ${error}`);
      throw error;
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    if (job.attemptsMade < (job.opts?.attempts || 3)) return;

    this.logger.error(`Webhook job ${job.id} exhausted all retries — moving to DLQ. Error: ${error.message}`);

    try {
      await this.dlq.add('dead-webhook', {
        originalJobId: job.id,
        body: job.data?.body,
        error: error.message,
        attempts: job.attemptsMade,
        movedAt: new Date().toISOString(),
      });
    } catch (dlqErr) {
      this.logger.error(`Failed to add job ${job.id} to DLQ: ${dlqErr}`);
    }
  }
}

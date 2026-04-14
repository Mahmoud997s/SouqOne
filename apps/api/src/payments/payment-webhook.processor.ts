import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentsService } from './payments.service';

export const PAYMENT_WEBHOOK_QUEUE = 'payment-webhook';

@Processor(PAYMENT_WEBHOOK_QUEUE)
export class PaymentWebhookProcessor {
  private readonly logger = new Logger(PaymentWebhookProcessor.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Process()
  async handleWebhook(job: Job<{ body: any }>) {
    this.logger.log(`Processing webhook job ${job.id}`);
    try {
      await this.paymentsService.handleWebhook(job.data.body);
      this.logger.log(`Webhook job ${job.id} completed`);
    } catch (error) {
      this.logger.error(`Webhook job ${job.id} failed: ${error}`);
      throw error;
    }
  }
}

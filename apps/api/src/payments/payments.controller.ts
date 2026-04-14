import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Headers,
  UseGuards,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Request } from 'express';
import { PAYMENT_WEBHOOK_QUEUE } from './payment-webhook.processor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreateFeaturedPaymentDto } from './dto/create-featured-payment.dto';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';

interface JwtPayload { sub: string; username: string }

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    @InjectQueue(PAYMENT_WEBHOOK_QUEUE) private readonly webhookQueue: Queue,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('featured')
  createFeatured(
    @Body() dto: CreateFeaturedPaymentDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.paymentsService.createFeaturedPayment(dto, (req.user as JwtPayload).sub, ip, idempotencyKey);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  createSubscription(
    @Body() dto: CreateSubscriptionPaymentDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string);
    return this.paymentsService.createSubscriptionPayment(dto, (req.user as JwtPayload).sub, ip, idempotencyKey);
  }

  @Get('verify/:sessionId')
  verify(@Param('sessionId') sessionId: string) {
    return this.paymentsService.verifyPayment(sessionId);
  }

  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Headers('x-thawani-secret') secret?: string,
  ) {
    const expectedSecret = process.env.THAWANI_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      this.logger.warn('Webhook rejected — invalid secret');
      throw new ForbiddenException('Invalid webhook secret');
    }
    await this.webhookQueue.add(
      { body },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myPayments(@Req() req: Request) {
    return this.paymentsService.myPayments((req.user as JwtPayload).sub);
  }

  @Get('plans')
  getPlans() {
    return this.paymentsService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  mySubscription(@Req() req: Request) {
    return this.paymentsService.mySubscription((req.user as JwtPayload).sub);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('subscription/cancel')
  cancelSubscription(@Req() req: Request) {
    return this.paymentsService.cancelSubscription((req.user as JwtPayload).sub);
  }
}

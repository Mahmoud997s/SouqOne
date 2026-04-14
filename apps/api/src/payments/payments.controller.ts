import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreateFeaturedPaymentDto } from './dto/create-featured-payment.dto';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';

interface JwtPayload { sub: string; username: string }

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('featured')
  createFeatured(@Body() dto: CreateFeaturedPaymentDto, @Req() req: Request) {
    return this.paymentsService.createFeaturedPayment(dto, (req.user as JwtPayload).sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  createSubscription(@Body() dto: CreateSubscriptionPaymentDto, @Req() req: Request) {
    return this.paymentsService.createSubscriptionPayment(dto, (req.user as JwtPayload).sub);
  }

  @Get('verify/:sessionId')
  verify(@Param('sessionId') sessionId: string) {
    return this.paymentsService.verifyPayment(sessionId);
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body);
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

  @UseGuards(JwtAuthGuard)
  @Post('subscription/cancel')
  cancelSubscription(@Req() req: Request) {
    return this.paymentsService.cancelSubscription((req.user as JwtPayload).sub);
  }
}

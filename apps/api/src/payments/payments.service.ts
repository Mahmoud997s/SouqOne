import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ThawaniService } from './thawani.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFeaturedPaymentDto } from './dto/create-featured-payment.dto';
import { CreateSubscriptionPaymentDto } from './dto/create-subscription-payment.dto';

const FEATURED_PRICE_BAISA = 2000; // 2 OMR
const FEATURED_DURATION_DAYS = 30;

const PLAN_PRICES: Record<string, { baisa: number; name: string }> = {
  PRO: { baisa: 5000, name: 'اشتراك برو' },
  ENTERPRISE: { baisa: 15000, name: 'اشتراك إنتربرايز' },
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly thawani: ThawaniService,
    private readonly notifications: NotificationsService,
  ) {}

  // ── Featured listing payment ──

  async createFeaturedPayment(dto: CreateFeaturedPaymentDto, userId: string) {
    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: FEATURED_PRICE_BAISA,
        type: 'FEATURED',
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    const session = await this.thawani.createSession({
      clientReferenceId: payment.id,
      products: [{ name: 'إعلان مميز — 30 يوم', quantity: 1, unit_amount: FEATURED_PRICE_BAISA }],
      successUrl: `${baseUrl}/payment/success?session_id={session_id}`,
      cancelUrl: `${baseUrl}/payment/cancel`,
      metadata: { paymentId: payment.id, type: 'FEATURED' },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { thawaniSessionId: session.session_id },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: this.thawani.getCheckoutUrl(session.session_id),
      sessionId: session.session_id,
    };
  }

  // ── Subscription payment ──

  async createSubscriptionPayment(dto: CreateSubscriptionPaymentDto, userId: string) {
    const planInfo = PLAN_PRICES[dto.plan];
    if (!planInfo) throw new BadRequestException('الخطة غير صالحة');

    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: planInfo.baisa,
        type: 'SUBSCRIPTION',
        metadata: { plan: dto.plan },
      },
    });

    const session = await this.thawani.createSession({
      clientReferenceId: payment.id,
      products: [{ name: planInfo.name, quantity: 1, unit_amount: planInfo.baisa }],
      successUrl: `${baseUrl}/payment/success?session_id={session_id}`,
      cancelUrl: `${baseUrl}/payment/cancel`,
      metadata: { paymentId: payment.id, type: 'SUBSCRIPTION', plan: dto.plan },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { thawaniSessionId: session.session_id },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: this.thawani.getCheckoutUrl(session.session_id),
      sessionId: session.session_id,
    };
  }

  // ── Verify / Webhook ──

  async verifyPayment(sessionId: string) {
    const session = await this.thawani.getSession(sessionId);
    const payment = await this.prisma.payment.findUnique({
      where: { thawaniSessionId: sessionId },
    });

    if (!payment) throw new NotFoundException('الدفعة غير موجودة');

    if (session.payment_status === 'paid' && payment.status !== 'PAID') {
      await this.handlePaymentSuccess(payment.id);
    }

    return { status: session.payment_status, paymentId: payment.id };
  }

  async handleWebhook(body: any) {
    const sessionId = body?.data?.session_id;
    const status = body?.data?.payment_status;

    if (!sessionId) return { received: true };

    if (status === 'paid') {
      const payment = await this.prisma.payment.findUnique({
        where: { thawaniSessionId: sessionId },
      });
      if (payment && payment.status !== 'PAID') {
        await this.handlePaymentSuccess(payment.id);
      }
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentId: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'PAID', paidAt: new Date() },
    });

    if (payment.type === 'FEATURED' && payment.entityType && payment.entityId) {
      await this.activateFeatured(payment.entityType, payment.entityId);
    }

    if (payment.type === 'SUBSCRIPTION') {
      const plan = (payment.metadata as any)?.plan as string;
      await this.activateSubscription(payment.userId, plan as SubscriptionPlan, payment.id);
    }

    try {
      await this.notifications.create({
        type: 'PAYMENT_SUCCESS',
        title: 'تمت عملية الدفع بنجاح',
        body: payment.type === 'FEATURED' ? 'تم تفعيل الإعلان المميز' : 'تم تفعيل الاشتراك',
        userId: payment.userId,
        data: { paymentId: payment.id },
      });
    } catch { /* non-critical */ }
  }

  private async activateFeatured(entityType: string, entityId: string) {
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + FEATURED_DURATION_DAYS);

    const data = { isPremium: true, featuredUntil };

    switch (entityType) {
      case 'LISTING':
        await this.prisma.listing.update({ where: { id: entityId }, data });
        break;
      case 'BUS_LISTING':
        await this.prisma.busListing.update({ where: { id: entityId }, data });
        break;
      case 'EQUIPMENT_LISTING':
        await this.prisma.equipmentListing.update({ where: { id: entityId }, data });
        break;
    }
  }

  private async activateSubscription(userId: string, plan: SubscriptionPlan, paymentId: string) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        endDate,
        paymentId,
      },
      update: {
        plan,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate,
        paymentId,
      },
    });

    try {
      await this.notifications.create({
        type: 'SUBSCRIPTION_ACTIVATED',
        title: 'تم تفعيل الاشتراك',
        body: `تم تفعيل خطة ${plan}`,
        userId,
        data: { plan },
      });
    } catch { /* non-critical */ }
  }

  // ── User payments history ──

  async myPayments(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── Subscription info ──

  async mySubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async getPlans() {
    return [
      { plan: 'BASIC', price: 0, priceLabel: 'مجاني', listings: 3, featured: 0, priority: false },
      { plan: 'PRO', price: 5, priceLabel: '5 ر.ع./شهر', listings: 20, featured: 2, priority: false },
      { plan: 'ENTERPRISE', price: 15, priceLabel: '15 ر.ع./شهر', listings: -1, featured: 10, priority: true },
    ];
  }

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('لا يوجد اشتراك');

    await this.prisma.subscription.update({
      where: { userId },
      data: { autoRenew: false },
    });

    return { message: 'تم إلغاء التجديد التلقائي' };
  }
}

import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { AdminApiKeyGuard } from '../common/guards/admin-api-key.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AdminApiKeyGuard)
@Controller('admin/payments')
export class AdminPaymentsController {
  private readonly logger = new Logger(AdminPaymentsController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const p = Math.max(parseInt(page || '1', 10), 1);
    const l = Math.min(parseInt(limit || '20', 10), 100);
    const skip = (p - 1) * l;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: { user: { select: { id: true, username: true, email: true } } },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } };
  }

  @Get('stats')
  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalRevenue, countByStatus, todayPayments, recentFraudSignals] = await this.prisma.$transaction([
      this.prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        _count: true,
      }),
      this.prisma.payment.count({
        where: { createdAt: { gte: todayStart } },
      }),
      // Fraud signal: users with > 10 payment attempts in last hour
      this.prisma.payment.groupBy({
        by: ['userId'],
        orderBy: { userId: 'asc' },
        where: {
          createdAt: { gte: new Date(Date.now() - 3600_000) },
        },
        _count: true,
        having: { userId: { _count: { gt: 10 } } },
      }),
    ]);

    if (recentFraudSignals.length > 0) {
      this.logger.warn(`Fraud signal: ${recentFraudSignals.length} users with >10 payment attempts/hour`);
    }

    const statusMap: Record<string, number> = {};
    for (const s of countByStatus) {
      statusMap[s.status] = typeof s._count === 'number' ? s._count : 0;
    }

    return {
      totalRevenueBaisa: totalRevenue._sum.amount || 0,
      totalRevenueOMR: ((totalRevenue._sum.amount || 0) / 1000).toFixed(3),
      totalPaidCount: totalRevenue._count,
      todayPayments,
      byStatus: statusMap,
      fraudSignals: recentFraudSignals.map(s => ({ userId: s.userId, attempts: s._count })),
    };
  }
}

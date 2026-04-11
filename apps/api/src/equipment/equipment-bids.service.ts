import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, EquipmentRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateEquipmentBidDto } from './dto/create-equipment-bid.dto';
import { USER_SELECT } from './equipment.utils';

const MAX_BIDS_PER_DAY = 10;
const DAY_SECONDS = 86400;
const COOLDOWN_SECONDS = 3600;

@Injectable()
export class EquipmentBidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(requestId: string, dto: CreateEquipmentBidDto, userId: string) {
    const req = await this.prisma.equipmentRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('الطلب غير موجود');
    if (req.userId === userId) throw new BadRequestException('لا يمكنك تقديم عرض على طلبك');
    if (req.requestStatus !== 'OPEN' && req.requestStatus !== 'IN_PROGRESS')
      throw new BadRequestException('الطلب مغلق');

    // Rate limit: max pending bid per request (DB check — still needed for correctness)
    const existing = await this.prisma.equipmentBid.findFirst({
      where: { requestId, userId, bidStatus: 'PENDING' },
    });
    if (existing) throw new BadRequestException('لديك عرض قائم بالفعل على هذا الطلب');

    // Rate limit: max bids per day (Redis-based, atomic across instances)
    const dailyKey = `bid:daily:${userId}`;
    const dailyCount = await this.redis.incr(dailyKey, DAY_SECONDS);
    if (dailyCount > MAX_BIDS_PER_DAY) {
      throw new BadRequestException(`الحد الأقصى ${MAX_BIDS_PER_DAY} عروض في اليوم`);
    }

    // Cooldown: 1 hour after withdrawing a bid on the same request (Redis-based)
    const cooldownKey = `bid:cooldown:${userId}:${requestId}`;
    const hasCooldown = await this.redis.exists(cooldownKey);
    if (hasCooldown) {
      const ttl = await this.redis.getTTL(cooldownKey);
      const mins = Math.ceil(ttl / 60);
      throw new BadRequestException(`يجب الانتظار ${mins} دقيقة بعد سحب عرضك قبل تقديم عرض جديد`);
    }

    const bid = await this.prisma.equipmentBid.create({
      data: {
        price: new Prisma.Decimal(dto.price),
        currency: dto.currency ?? 'OMR',
        availability: dto.availability,
        notes: dto.notes,
        withOperator: dto.withOperator ?? false,
        requestId,
        userId,
      },
      include: { user: { select: USER_SELECT } },
    });

    if (req.requestStatus === 'OPEN') {
      await this.prisma.equipmentRequest.update({ where: { id: requestId }, data: { requestStatus: 'IN_PROGRESS' } });
    }

    return bid;
  }

  async accept(requestId: string, bidId: string, userId: string) {
    const req = await this.prisma.equipmentRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('الطلب غير موجود');
    if (req.userId !== userId) throw new ForbiddenException('فقط صاحب الطلب يمكنه قبول العروض');

    const bid = await this.prisma.equipmentBid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) throw new NotFoundException('العرض غير موجود');

    await this.prisma.$transaction([
      this.prisma.equipmentBid.update({ where: { id: bidId }, data: { bidStatus: 'ACCEPTED' } }),
      this.prisma.equipmentBid.updateMany({
        where: { requestId, id: { not: bidId }, bidStatus: 'PENDING' },
        data: { bidStatus: 'REJECTED' },
      }),
      this.prisma.equipmentRequest.update({ where: { id: requestId }, data: { requestStatus: 'CLOSED' as EquipmentRequestStatus } }),
    ]);

    return this.prisma.equipmentBid.findUnique({ where: { id: bidId }, include: { user: { select: USER_SELECT } } });
  }

  async reject(requestId: string, bidId: string, userId: string) {
    const req = await this.prisma.equipmentRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('الطلب غير موجود');
    if (req.userId !== userId) throw new ForbiddenException('فقط صاحب الطلب يمكنه رفض العروض');

    const bid = await this.prisma.equipmentBid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) throw new NotFoundException('العرض غير موجود');

    return this.prisma.equipmentBid.update({ where: { id: bidId }, data: { bidStatus: 'REJECTED' }, include: { user: { select: USER_SELECT } } });
  }

  async withdraw(requestId: string, bidId: string, userId: string) {
    const bid = await this.prisma.equipmentBid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) throw new NotFoundException('العرض غير موجود');
    if (bid.userId !== userId) throw new ForbiddenException('لا يمكنك سحب عرض غيرك');
    if (bid.bidStatus !== 'PENDING') throw new BadRequestException('لا يمكن سحب عرض غير معلق');

    const updated = await this.prisma.equipmentBid.update({
      where: { id: bidId },
      data: { bidStatus: 'WITHDRAWN' },
      include: { user: { select: USER_SELECT } },
    });

    // Set cooldown in Redis so the user can't re-bid for 1 hour
    await this.redis.setNX(`bid:cooldown:${userId}:${requestId}`, '1', COOLDOWN_SECONDS);

    return updated;
  }
}

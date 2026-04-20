import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

// Entity type labels for notifications
const ENTITY_LABELS: Record<string, string> = {
  CAR: 'سيارة',
  BUS: 'باص',
  EQUIPMENT: 'معدة',
  TRANSPORT: 'خدمة نقل',
  TRIP: 'رحلة',
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly repo: BookingsRepository,
  ) {}

  // ── حاسبة السعر ──
  calculatePrice(
    totalDays: number,
    dailyPrice?: number | null,
    weeklyPrice?: number | null,
    monthlyPrice?: number | null,
  ): { totalPrice: number; breakdown: string } {
    if (!dailyPrice && !weeklyPrice && !monthlyPrice) {
      throw new BadRequestException('لا توجد أسعار إيجار محددة لهذا الإعلان');
    }

    const daily = dailyPrice ? Number(dailyPrice) : Infinity;
    const weekly = weeklyPrice ? Number(weeklyPrice) / 7 : Infinity;
    const monthly = monthlyPrice ? Number(monthlyPrice) / 30 : Infinity;

    let totalPrice: number;
    let breakdown: string;

    if (totalDays >= 30 && monthly !== Infinity) {
      const months = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;
      const monthCost = months * Number(monthlyPrice);
      const dayCost = remainingDays * Math.min(daily, weekly);
      totalPrice = monthCost + dayCost;
      breakdown = `${months} شهر × ${monthlyPrice} ر.ع.`;
      if (remainingDays > 0) breakdown += ` + ${remainingDays} يوم`;
    } else if (totalDays >= 7 && weekly !== Infinity) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      const weekCost = weeks * Number(weeklyPrice);
      const dayCost = remainingDays * daily;
      totalPrice = weekCost + (daily !== Infinity ? dayCost : 0);
      breakdown = `${weeks} أسبوع × ${weeklyPrice} ر.ع.`;
      if (remainingDays > 0 && daily !== Infinity) breakdown += ` + ${remainingDays} يوم`;
    } else {
      totalPrice = totalDays * daily;
      breakdown = `${totalDays} يوم × ${dailyPrice} ر.ع.`;
    }

    return { totalPrice: Math.round(totalPrice * 1000) / 1000, breakdown };
  }

  // ── Resolve entity by type ──
  private async resolveEntity(entityType: string, entityId: string) {
    switch (entityType) {
      case 'CAR': {
        const listing = await this.prisma.listing.findUnique({
          where: { id: entityId },
          include: { seller: { select: { id: true, displayName: true, username: true } } },
        });
        if (!listing) throw new NotFoundException('الإعلان غير موجود');
        if (listing.listingType !== 'RENTAL') throw new BadRequestException('هذا الإعلان ليس للإيجار');
        if (listing.status !== 'ACTIVE') throw new BadRequestException('الإعلان غير متاح حالياً');
        return {
          title: listing.title,
          ownerId: listing.sellerId,
          dailyPrice: listing.dailyPrice ? Number(listing.dailyPrice) : null,
          weeklyPrice: listing.weeklyPrice ? Number(listing.weeklyPrice) : null,
          monthlyPrice: listing.monthlyPrice ? Number(listing.monthlyPrice) : null,
          minRentalDays: listing.minRentalDays,
          depositAmount: listing.depositAmount,
          currency: listing.currency,
          cancellationPolicy: listing.cancellationPolicy ?? 'FREE',
          connectField: { listing: { connect: { id: entityId } } },
        };
      }
      case 'BUS': {
        const bus = await this.prisma.busListing.findUnique({
          where: { id: entityId },
          include: { user: { select: { id: true, displayName: true, username: true } } },
        });
        if (!bus) throw new NotFoundException('إعلان الباص غير موجود');
        if (bus.busListingType !== 'BUS_RENT') throw new BadRequestException('هذا الإعلان ليس للإيجار');
        if (bus.status !== 'ACTIVE') throw new BadRequestException('الإعلان غير متاح حالياً');
        return {
          title: bus.title,
          ownerId: bus.userId,
          dailyPrice: bus.dailyPrice ? Number(bus.dailyPrice) : null,
          weeklyPrice: null,
          monthlyPrice: bus.monthlyPrice ? Number(bus.monthlyPrice) : null,
          minRentalDays: bus.minRentalDays,
          depositAmount: null,
          currency: bus.currency,
          cancellationPolicy: 'FREE' as const,
          connectField: { busListing: { connect: { id: entityId } } },
        };
      }
      case 'EQUIPMENT': {
        const eq = await this.prisma.equipmentListing.findUnique({
          where: { id: entityId },
          include: { user: { select: { id: true, displayName: true, username: true } } },
        });
        if (!eq) throw new NotFoundException('إعلان المعدة غير موجود');
        if (eq.listingType !== 'EQUIPMENT_RENT') throw new BadRequestException('هذا الإعلان ليس للإيجار');
        if (eq.status !== 'ACTIVE') throw new BadRequestException('الإعلان غير متاح حالياً');
        return {
          title: eq.title,
          ownerId: eq.userId,
          dailyPrice: eq.dailyPrice ? Number(eq.dailyPrice) : null,
          weeklyPrice: eq.weeklyPrice ? Number(eq.weeklyPrice) : null,
          monthlyPrice: eq.monthlyPrice ? Number(eq.monthlyPrice) : null,
          minRentalDays: eq.minRentalDays,
          depositAmount: null,
          currency: eq.currency,
          cancellationPolicy: 'FREE' as const,
          connectField: { equipmentListing: { connect: { id: entityId } } },
        };
      }
      case 'TRANSPORT': {
        const ts = await this.prisma.transportService.findUnique({
          where: { id: entityId },
          include: { user: { select: { id: true, displayName: true, username: true } } },
        });
        if (!ts) throw new NotFoundException('خدمة النقل غير موجودة');
        if (ts.status !== 'ACTIVE') throw new BadRequestException('الخدمة غير متاحة حالياً');
        return {
          title: ts.title,
          ownerId: ts.userId,
          dailyPrice: ts.basePrice ? Number(ts.basePrice) : null,
          weeklyPrice: null,
          monthlyPrice: null,
          minRentalDays: null,
          depositAmount: null,
          currency: ts.currency,
          cancellationPolicy: 'FREE' as const,
          connectField: { transportService: { connect: { id: entityId } } },
        };
      }
      case 'TRIP': {
        const trip = await this.prisma.tripService.findUnique({
          where: { id: entityId },
          include: { user: { select: { id: true, displayName: true, username: true } } },
        });
        if (!trip) throw new NotFoundException('الرحلة غير موجودة');
        if (trip.status !== 'ACTIVE') throw new BadRequestException('الرحلة غير متاحة حالياً');
        return {
          title: trip.title,
          ownerId: trip.userId,
          dailyPrice: trip.pricePerTrip ? Number(trip.pricePerTrip) : null,
          weeklyPrice: null,
          monthlyPrice: trip.priceMonthly ? Number(trip.priceMonthly) : null,
          minRentalDays: null,
          depositAmount: null,
          currency: trip.currency,
          cancellationPolicy: 'FREE' as const,
          connectField: { tripService: { connect: { id: entityId } } },
        };
      }
      default:
        throw new BadRequestException('نوع إعلان غير مدعوم');
    }
  }

  // ── إنشاء حجز ──
  async create(dto: CreateBookingDto, renterId: string) {
    const entity = await this.resolveEntity(dto.entityType, dto.entityId);

    if (entity.ownerId === renterId) throw new BadRequestException('لا يمكنك حجز إعلانك');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) throw new BadRequestException('تاريخ البداية يجب أن يكون في المستقبل');
    if (endDate <= startDate) throw new BadRequestException('تاريخ النهاية يجب أن يكون بعد البداية');

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (entity.minRentalDays && totalDays < entity.minRentalDays) {
      throw new BadRequestException(`أقل مدة إيجار ${entity.minRentalDays} يوم`);
    }

    // التحقق من التضارب
    const conflict = await this.repo.findConflicting(dto.entityType, dto.entityId, startDate, endDate);
    if (conflict) throw new BadRequestException('محجوز في هذه الفترة');

    const { totalPrice } = this.calculatePrice(
      totalDays,
      entity.dailyPrice,
      entity.weeklyPrice,
      entity.monthlyPrice,
    );

    const booking = await this.repo.create({
      entityType: dto.entityType,
      ...entity.connectField,
      renter: { connect: { id: renterId } },
      owner: { connect: { id: entity.ownerId } },
      startDate,
      endDate,
      totalDays,
      totalPrice: new Prisma.Decimal(totalPrice),
      depositAmount: entity.depositAmount,
      currency: entity.currency,
      status: 'PENDING',
      cancellationPolicy: entity.cancellationPolicy,
      driverRequested: dto.driverRequested ?? false,
      insuranceSelected: dto.insuranceSelected ?? false,
      pickupLocation: dto.pickupLocation,
      dropoffLocation: dto.dropoffLocation,
      notes: dto.notes,
    });

    // إشعار للمؤجر
    const label = ENTITY_LABELS[dto.entityType] || 'إعلان';
    await this.notifications.create({
      type: 'BOOKING_REQUEST',
      title: 'طلب حجز جديد',
      body: `لديك طلب حجز جديد لـ${label} ${entity.title}`,
      userId: entity.ownerId,
      data: { bookingId: booking.id, entityType: dto.entityType, entityId: dto.entityId },
    });

    return booking;
  }

  // ── حجوزاتي (كمستأجر) ──
  async findMyBookings(renterId: string, query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = { renterId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.repo.findMyBookings(where, skip, limit);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── الحجوزات الواردة (كمؤجر) ──
  async findReceivedBookings(ownerId: string, query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = { ownerId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.repo.findReceivedBookings(where, skip, limit);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── تفاصيل حجز ──
  async findOne(id: string, userId: string) {
    const booking = await this.repo.findById(id);

    if (!booking) throw new NotFoundException('الحجز غير موجود');
    if (booking.renterId !== userId && booking.ownerId !== userId) {
      throw new ForbiddenException('ليس لديك صلاحية لعرض هذا الحجز');
    }

    return booking;
  }

  // ── Helper: get entity title from booking ──
  private getEntityTitle(booking: any): string {
    if (booking.listing) return booking.listing.title;
    if (booking.busListing) return booking.busListing.title;
    if (booking.equipmentListing) return booking.equipmentListing.title;
    if (booking.transportService) return booking.transportService.title;
    if (booking.tripService) return booking.tripService.title;
    return 'إعلان';
  }

  // ── تغيير حالة الحجز ──
  async updateStatus(id: string, dto: UpdateBookingStatusDto, userId: string) {
    const booking = await this.repo.findByIdWithEntity(id);

    if (!booking) throw new NotFoundException('الحجز غير موجود');

    const { status } = dto;
    const isOwner = booking.ownerId === userId;
    const isRenter = booking.renterId === userId;

    // صلاحيات
    if (status === 'CONFIRMED' && !isOwner) throw new ForbiddenException('المؤجر فقط يمكنه التأكيد');
    if (status === 'REJECTED' && !isOwner) throw new ForbiddenException('المؤجر فقط يمكنه الرفض');
    if (status === 'CANCELLED' && !isRenter && !isOwner) throw new ForbiddenException('غير مصرح');
    if (status === 'ACTIVE' && !isOwner) throw new ForbiddenException('المؤجر فقط يمكنه تفعيل الحجز');
    if (status === 'COMPLETED' && !isOwner) throw new ForbiddenException('المؤجر فقط يمكنه إكمال الحجز');

    // Transitions
    const validTransitions: Record<string, BookingStatus[]> = {
      PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
      CONFIRMED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`لا يمكن تغيير الحالة من ${booking.status} إلى ${status}`);
    }

    const updateData: Prisma.BookingUpdateInput = { status };
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const updated = await this.repo.update(id, updateData);

    // إشعارات
    const entityTitle = this.getEntityTitle(booking);
    const label = ENTITY_LABELS[booking.entityType] || 'إعلان';
    const notifMap: Record<string, { type: string; title: string; body: string; to: string }> = {
      CONFIRMED: { type: 'BOOKING_CONFIRMED', title: 'تم تأكيد حجزك', body: `تم تأكيد حجزك لـ${label} ${entityTitle}`, to: booking.renterId },
      REJECTED: { type: 'BOOKING_REJECTED', title: 'تم رفض الحجز', body: `تم رفض حجزك لـ${label} ${entityTitle}`, to: booking.renterId },
      CANCELLED: { type: 'BOOKING_CANCELLED', title: 'تم إلغاء الحجز', body: `تم إلغاء الحجز لـ${label} ${entityTitle}`, to: isRenter ? booking.ownerId : booking.renterId },
      COMPLETED: { type: 'BOOKING_COMPLETED', title: 'تم إكمال الحجز', body: `تم إكمال حجز ${label} ${entityTitle}`, to: booking.renterId },
    };

    const notif = notifMap[status];
    if (notif) {
      await this.notifications.create({
        type: notif.type as any,
        title: notif.title,
        body: notif.body,
        userId: notif.to,
        data: { bookingId: id, entityType: booking.entityType },
      });
    }

    return updated;
  }

  // ── التواريخ المحجوزة ──
  async getAvailability(entityType: string, entityId: string) {
    return this.repo.findActiveBookings(entityType, entityId);
  }

  // ── حاسبة سعر API ──
  async calculatePriceForEntity(entityType: string, entityId: string, startDate: string, endDate: string) {
    const entity = await this.resolveEntity(entityType, entityId);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) throw new BadRequestException('مدة غير صالحة');

    const result = this.calculatePrice(
      totalDays,
      entity.dailyPrice,
      entity.weeklyPrice,
      entity.monthlyPrice,
    );

    return {
      totalDays,
      ...result,
      depositAmount: entity.depositAmount ? Number(entity.depositAmount) : null,
      currency: entity.currency,
    };
  }

}

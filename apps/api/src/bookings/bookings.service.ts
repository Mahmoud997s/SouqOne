import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
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

  // ── إنشاء حجز ──
  async create(dto: CreateBookingDto, renterId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { seller: { select: { id: true, displayName: true, username: true } } },
    });

    if (!listing) throw new NotFoundException('الإعلان غير موجود');
    if (listing.listingType !== 'RENTAL') throw new BadRequestException('هذا الإعلان ليس للإيجار');
    if (listing.status !== 'ACTIVE') throw new BadRequestException('الإعلان غير متاح حالياً');
    if (listing.sellerId === renterId) throw new BadRequestException('لا يمكنك حجز سيارتك');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (startDate < now) throw new BadRequestException('تاريخ البداية يجب أن يكون في المستقبل');
    if (endDate <= startDate) throw new BadRequestException('تاريخ النهاية يجب أن يكون بعد البداية');

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (listing.minRentalDays && totalDays < listing.minRentalDays) {
      throw new BadRequestException(`أقل مدة إيجار ${listing.minRentalDays} يوم`);
    }

    // التحقق من التضارب
    const conflict = await this.prisma.booking.findFirst({
      where: {
        listingId: dto.listingId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });

    if (conflict) throw new BadRequestException('السيارة محجوزة في هذه الفترة');

    const { totalPrice } = this.calculatePrice(
      totalDays,
      listing.dailyPrice ? Number(listing.dailyPrice) : null,
      listing.weeklyPrice ? Number(listing.weeklyPrice) : null,
      listing.monthlyPrice ? Number(listing.monthlyPrice) : null,
    );

    const booking = await this.prisma.booking.create({
      data: {
        listingId: dto.listingId,
        renterId,
        ownerId: listing.sellerId,
        startDate,
        endDate,
        totalDays,
        totalPrice: new Prisma.Decimal(totalPrice),
        depositAmount: listing.depositAmount,
        currency: listing.currency,
        status: 'PENDING',
        cancellationPolicy: listing.cancellationPolicy ?? 'FREE',
        driverRequested: dto.driverRequested ?? false,
        insuranceSelected: dto.insuranceSelected ?? false,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        notes: dto.notes,
      },
      include: {
        listing: { include: { images: true } },
        renter: { select: this.userSelect },
        owner: { select: this.userSelect },
      },
    });

    // إشعار للمؤجر
    await this.notifications.create({
      type: 'BOOKING_REQUEST',
      title: 'طلب حجز جديد',
      body: `لديك طلب حجز جديد لسيارة ${listing.title}`,
      userId: listing.sellerId,
      data: { bookingId: booking.id, listingId: listing.id },
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { include: { images: true } },
          owner: { select: this.userSelect },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── الحجوزات الواردة (كمؤجر) ──
  async findReceivedBookings(ownerId: string, query: QueryBookingsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = { ownerId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { include: { images: true } },
          renter: { select: this.userSelect },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ── تفاصيل حجز ──
  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { include: { images: true, seller: { select: this.userSelect } } },
        renter: { select: this.userSelect },
        owner: { select: this.userSelect },
      },
    });

    if (!booking) throw new NotFoundException('الحجز غير موجود');
    if (booking.renterId !== userId && booking.ownerId !== userId) {
      throw new ForbiddenException('ليس لديك صلاحية لعرض هذا الحجز');
    }

    return booking;
  }

  // ── تغيير حالة الحجز ──
  async updateStatus(id: string, dto: UpdateBookingStatusDto, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });

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

    const updated = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        listing: { include: { images: true } },
        renter: { select: this.userSelect },
        owner: { select: this.userSelect },
      },
    });

    // إشعارات
    const notifMap: Record<string, { type: string; title: string; body: string; to: string }> = {
      CONFIRMED: { type: 'BOOKING_CONFIRMED', title: 'تم تأكيد حجزك', body: `تم تأكيد حجزك لسيارة ${booking.listing.title}`, to: booking.renterId },
      REJECTED: { type: 'BOOKING_REJECTED', title: 'تم رفض الحجز', body: `تم رفض حجزك لسيارة ${booking.listing.title}`, to: booking.renterId },
      CANCELLED: { type: 'BOOKING_CANCELLED', title: 'تم إلغاء الحجز', body: `تم إلغاء الحجز لسيارة ${booking.listing.title}`, to: isRenter ? booking.ownerId : booking.renterId },
      COMPLETED: { type: 'BOOKING_COMPLETED', title: 'تم إكمال الحجز', body: `تم إكمال حجز سيارة ${booking.listing.title}`, to: booking.renterId },
    };

    const notif = notifMap[status];
    if (notif) {
      await this.notifications.create({
        type: notif.type as any,
        title: notif.title,
        body: notif.body,
        userId: notif.to,
        data: { bookingId: id, listingId: booking.listingId },
      });
    }

    return updated;
  }

  // ── التواريخ المحجوزة ──
  async getAvailability(listingId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      },
      select: { startDate: true, endDate: true, status: true },
      orderBy: { startDate: 'asc' },
    });

    return bookings;
  }

  // ── حاسبة سعر API ──
  async calculatePriceForListing(listingId: string, startDate: string, endDate: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('الإعلان غير موجود');
    if (listing.listingType !== 'RENTAL') throw new BadRequestException('ليس إعلان إيجار');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) throw new BadRequestException('مدة غير صالحة');

    const result = this.calculatePrice(
      totalDays,
      listing.dailyPrice ? Number(listing.dailyPrice) : null,
      listing.weeklyPrice ? Number(listing.weeklyPrice) : null,
      listing.monthlyPrice ? Number(listing.monthlyPrice) : null,
    );

    return {
      totalDays,
      ...result,
      depositAmount: listing.depositAmount ? Number(listing.depositAmount) : null,
      currency: listing.currency,
    };
  }

  private readonly userSelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    governorate: true,
    isVerified: true,
    phone: true,
  };
}

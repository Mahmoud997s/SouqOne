import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService, INDEXES } from '../search/search.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { QueryTripsDto } from './dto/query-trips.dto';

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const suffix = Date.now().toString(36);
    return `${base}-${suffix}`;
  }

  async create(dto: CreateTripDto, userId: string) {
    const slug = this.generateSlug(dto.title);

    const item = await this.prisma.tripService.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        tripType: dto.tripType,
        routeFrom: dto.routeFrom,
        routeTo: dto.routeTo,
        routeStops: dto.routeStops ?? [],
        scheduleType: dto.scheduleType,
        departureTimes: dto.departureTimes ?? [],
        operatingDays: dto.operatingDays ?? [],
        pricePerTrip: dto.pricePerTrip ? new Prisma.Decimal(dto.pricePerTrip) : undefined,
        priceMonthly: dto.priceMonthly ? new Prisma.Decimal(dto.priceMonthly) : undefined,
        currency: dto.currency ?? 'OMR',
        vehicleType: dto.vehicleType,
        capacity: dto.capacity,
        availableSeats: dto.availableSeats,
        features: dto.features ?? [],
        providerName: dto.providerName,
        governorate: dto.governorate,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        whatsapp: dto.whatsapp,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        userId,
      },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.TRIPS, {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      tripType: item.tripType, routeFrom: item.routeFrom, routeTo: item.routeTo,
      providerName: item.providerName, scheduleType: item.scheduleType,
      pricePerTrip: item.pricePerTrip ? Number(item.pricePerTrip) : null,
      priceMonthly: item.priceMonthly ? Number(item.priceMonthly) : null,
      currency: item.currency, governorate: item.governorate, city: item.city,
      status: item.status, createdAt: item.createdAt,
    }).catch(() => {});

    return item;
  }

  async findAll(query: QueryTripsDto) {
    const page = parseInt(query.page ?? '1');
    const limit = Math.min(parseInt(query.limit ?? '20'), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.TripServiceWhereInput = { status: 'ACTIVE' };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { routeFrom: { contains: query.search, mode: 'insensitive' } },
        { routeTo: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.tripType) where.tripType = query.tripType;
    if (query.scheduleType) where.scheduleType = query.scheduleType;
    if (query.governorate) where.governorate = query.governorate;

    const [items, total] = await Promise.all([
      this.prisma.tripService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.tripService.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.tripService.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true } },
      },
    });
    if (!item) throw new NotFoundException('الرحلة غير موجودة');
    await this.prisma.tripService.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  async myTrips(userId: string) {
    return this.prisma.tripService.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateTripDto>) {
    const item = await this.prisma.tripService.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الرحلة غير موجودة');
    if (item.userId !== userId) throw new ForbiddenException('غير مصرح لك بتعديل هذا الإعلان');

    const data: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(dto)) {
      if (val !== undefined) {
        if (key === 'pricePerTrip' || key === 'priceMonthly') {
          data[key] = new Prisma.Decimal(val as number);
        } else if (key === 'startDate' || key === 'endDate') {
          data[key] = new Date(val as string);
        } else {
          data[key] = val;
        }
      }
    }
    const updated = await this.prisma.tripService.update({ where: { id }, data });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.TRIPS, {
      id: updated.id, title: updated.title, slug: updated.slug, description: updated.description,
      tripType: updated.tripType, routeFrom: updated.routeFrom, routeTo: updated.routeTo,
      providerName: updated.providerName, scheduleType: updated.scheduleType,
      pricePerTrip: updated.pricePerTrip ? Number(updated.pricePerTrip) : null,
      priceMonthly: updated.priceMonthly ? Number(updated.priceMonthly) : null,
      currency: updated.currency, governorate: updated.governorate, city: updated.city,
      status: updated.status, createdAt: updated.createdAt,
    }).catch(() => {});

    return updated;
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.tripService.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الرحلة غير موجودة');
    if (item.userId !== userId) throw new ForbiddenException('غير مصرح لك بحذف هذا الإعلان');
    await this.prisma.tripService.delete({ where: { id } });

    // Clean up orphaned conversations & favorites
    await this.prisma.cleanupPolymorphicOrphans('TRIP', id);

    // Remove from Meilisearch
    this.searchService.removeDocument(INDEXES.TRIPS, id).catch(() => {});

    return { message: 'تم حذف الإعلان بنجاح' };
  }
}

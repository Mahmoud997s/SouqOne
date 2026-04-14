import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService, INDEXES } from '../search/search.service';
import { BaseListingService, ListingConfig } from '../common/services/base-listing.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { QueryTripsDto } from './dto/query-trips.dto';

@Injectable()
export class TripsService extends BaseListingService {
  protected readonly config: ListingConfig = {
    modelName: 'tripService',
    meiliIndex: INDEXES.TRIPS,
    entityType: 'TRIP',
    notFoundMsg: 'الرحلة غير موجودة',
    decimalFields: ['pricePerTrip', 'priceMonthly'],
    dateFields: ['startDate', 'endDate'],
  };

  constructor(prisma: PrismaService, searchService: SearchService, redis: RedisService, eventEmitter: EventEmitter2) {
    super(prisma, searchService, redis, eventEmitter);
  }

  // Trips have no images relation — override includes
  protected getListInclude() {
    return { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } };
  }
  protected getDetailInclude() {
    return { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true } } };
  }
  protected getCreateInclude() {
    return { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } };
  }

  protected buildCreateData(dto: CreateTripDto, slug: string, userId: string) {
    return {
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
    };
  }

  protected buildMeiliDoc(item: any) {
    return {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      tripType: item.tripType, routeFrom: item.routeFrom, routeTo: item.routeTo,
      providerName: item.providerName, scheduleType: item.scheduleType,
      pricePerTrip: item.pricePerTrip ? Number(item.pricePerTrip) : null,
      priceMonthly: item.priceMonthly ? Number(item.priceMonthly) : null,
      currency: item.currency, governorate: item.governorate, city: item.city,
      status: item.status, imageUrl: null, createdAt: item.createdAt,
    };
  }

  protected buildWhereFilter(query: QueryTripsDto) {
    const where: any = {};
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
    return where;
  }
}

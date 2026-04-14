import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService, INDEXES } from '../search/search.service';
import { BaseListingService, ListingConfig } from '../common/services/base-listing.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { QueryTransportDto } from './dto/query-transport.dto';

@Injectable()
export class TransportService extends BaseListingService {
  protected readonly config: ListingConfig = {
    modelName: 'transportService',
    meiliIndex: INDEXES.TRANSPORT,
    entityType: 'TRANSPORT',
    notFoundMsg: 'خدمة النقل غير موجودة',
    decimalFields: ['basePrice', 'pricePerKm'],
  };

  constructor(prisma: PrismaService, searchService: SearchService, redis: RedisService, eventEmitter: EventEmitter2) {
    super(prisma, searchService, redis, eventEmitter);
  }

  protected buildCreateData(dto: CreateTransportDto, slug: string, userId: string) {
    return {
      title: dto.title,
      slug,
      description: dto.description,
      transportType: dto.transportType,
      vehicleType: dto.vehicleType,
      vehicleCapacity: dto.vehicleCapacity,
      coverageAreas: dto.coverageAreas ?? [],
      pricingType: dto.pricingType ?? 'NEGOTIABLE_PRICE',
      basePrice: dto.basePrice ? new Prisma.Decimal(dto.basePrice) : undefined,
      pricePerKm: dto.pricePerKm ? new Prisma.Decimal(dto.pricePerKm) : undefined,
      currency: dto.currency ?? 'OMR',
      hasInsurance: dto.hasInsurance ?? false,
      hasTracking: dto.hasTracking ?? false,
      providerName: dto.providerName,
      providerType: dto.providerType,
      governorate: dto.governorate,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
      contactPhone: dto.contactPhone,
      whatsapp: dto.whatsapp,
      userId,
    };
  }

  protected buildMeiliDoc(item: any) {
    return {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      transportType: item.transportType, providerName: item.providerName, providerType: item.providerType,
      basePrice: item.basePrice ? Number(item.basePrice) : null, currency: item.currency,
      governorate: item.governorate, city: item.city, coverageAreas: item.coverageAreas,
      hasInsurance: item.hasInsurance, hasTracking: item.hasTracking, status: item.status,
      imageUrl: item.images?.[0]?.url || null, createdAt: item.createdAt,
    };
  }

  protected buildWhereFilter(query: QueryTransportDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.transportType) where.transportType = query.transportType;
    if (query.providerType) where.providerType = query.providerType;
    if (query.governorate) where.governorate = query.governorate;
    return where;
  }
}

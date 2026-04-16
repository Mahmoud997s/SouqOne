import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService, INDEXES } from '../search/search.service';
import { BaseListingService, ListingConfig } from '../common/services/base-listing.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { QueryInsuranceDto } from './dto/query-insurance.dto';

@Injectable()
export class InsuranceService extends BaseListingService {
  protected readonly config: ListingConfig = {
    modelName: 'insuranceOffer',
    meiliIndex: INDEXES.INSURANCE,
    entityType: 'INSURANCE',
    notFoundMsg: 'العرض غير موجود',
    decimalFields: ['priceFrom'],
  };

  constructor(prisma: PrismaService, searchService: SearchService, redis: RedisService, eventEmitter: EventEmitter2) {
    super(prisma, searchService, redis, eventEmitter);
  }

  protected buildCreateData(dto: CreateInsuranceDto, slug: string, userId: string) {
    return {
      title: dto.title,
      slug,
      description: dto.description,
      offerType: dto.offerType,
      providerName: dto.providerName,
      providerLogo: dto.providerLogo,
      coverageType: dto.coverageType,
      priceFrom: dto.priceFrom ? new Prisma.Decimal(dto.priceFrom) : undefined,
      currency: dto.currency ?? 'OMR',
      features: dto.features ?? [],
      termsUrl: dto.termsUrl,
      contactPhone: dto.contactPhone,
      whatsapp: dto.whatsapp,
      website: dto.website,
      governorate: dto.governorate,
      latitude: dto.latitude,
      longitude: dto.longitude,
      userId,
    };
  }

  protected buildMeiliDoc(item: any) {
    return {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      offerType: item.offerType, providerName: item.providerName, coverageType: item.coverageType,
      priceFrom: item.priceFrom ? Number(item.priceFrom) : null, currency: item.currency,
      governorate: item.governorate, status: item.status,
      imageUrl: item.images?.[0]?.url ?? null,
      createdAt: item.createdAt,
    };
  }

  protected buildWhereFilter(query: QueryInsuranceDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { providerName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.offerType) where.offerType = query.offerType;
    if (query.governorate) where.governorate = query.governorate;
    if (query.userId) where.userId = query.userId;
    return where;
  }
}

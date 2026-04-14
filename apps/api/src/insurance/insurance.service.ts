import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  constructor(prisma: PrismaService, searchService: SearchService, redis: RedisService) {
    super(prisma, searchService, redis);
  }

  // Insurance has no images relation — override includes
  protected getListInclude() {
    return { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } };
  }
  protected getDetailInclude() {
    return { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true } } };
  }
  protected getCreateInclude() {
    return { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } };
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
      governorate: item.governorate, status: item.status, imageUrl: null, createdAt: item.createdAt,
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
    return where;
  }
}

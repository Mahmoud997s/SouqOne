import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService, INDEXES } from '../search/search.service';
import { BaseListingService, ListingConfig } from '../common/services/base-listing.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';

@Injectable()
export class ServicesService extends BaseListingService {
  protected readonly config: ListingConfig = {
    modelName: 'carService',
    meiliIndex: INDEXES.SERVICES,
    entityType: 'CAR_SERVICE',
    notFoundMsg: 'الخدمة غير موجودة',
    decimalFields: ['priceFrom', 'priceTo'],
  };

  constructor(prisma: PrismaService, searchService: SearchService, redis: RedisService, eventEmitter: EventEmitter2) {
    super(prisma, searchService, redis, eventEmitter);
  }

  protected buildCreateData(dto: CreateServiceDto, slug: string, userId: string) {
    return {
      title: dto.title,
      slug,
      description: dto.description,
      serviceType: dto.serviceType,
      providerType: dto.providerType,
      providerName: dto.providerName,
      specializations: dto.specializations ?? [],
      priceFrom: dto.priceFrom ? new Prisma.Decimal(dto.priceFrom) : undefined,
      priceTo: dto.priceTo ? new Prisma.Decimal(dto.priceTo) : undefined,
      currency: dto.currency ?? 'OMR',
      isHomeService: dto.isHomeService ?? false,
      workingHoursOpen: dto.workingHoursOpen,
      workingHoursClose: dto.workingHoursClose,
      workingDays: dto.workingDays ?? [],
      governorate: dto.governorate,
      city: dto.city,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      contactPhone: dto.contactPhone,
      whatsapp: dto.whatsapp,
      website: dto.website,
      userId,
    };
  }

  protected buildMeiliDoc(item: any) {
    return {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      serviceType: item.serviceType, providerName: item.providerName, providerType: item.providerType,
      priceFrom: item.priceFrom ? Number(item.priceFrom) : null, currency: item.currency,
      governorate: item.governorate, city: item.city, isHomeService: item.isHomeService,
      status: item.status, imageUrl: item.images?.[0]?.url || null, createdAt: item.createdAt,
    };
  }

  protected buildWhereFilter(query: QueryServicesDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { providerName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.serviceType) where.serviceType = query.serviceType;
    if (query.providerType) where.providerType = query.providerType;
    if (query.governorate) where.governorate = query.governorate;
    if (query.isHomeService !== undefined) where.isHomeService = query.isHomeService;
    return where;
  }
}

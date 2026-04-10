import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService, INDEXES } from '../search/search.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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

  async create(dto: CreateListingDto, sellerId: string) {
    const slug = this.generateSlug(`${dto.make}-${dto.model}-${dto.year}-${dto.title}`);

    const listing = await this.prisma.listing.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        price: new Prisma.Decimal(dto.price),
        mileage: dto.mileage,
        fuelType: dto.fuelType,
        transmission: dto.transmission,
        bodyType: dto.bodyType,
        exteriorColor: dto.exteriorColor,
        interior: dto.interior,
        engineSize: dto.engineSize,
        horsepower: dto.horsepower,
        doors: dto.doors,
        seats: dto.seats,
        driveType: dto.driveType,
        currency: dto.currency ?? 'OMR',
        isPriceNegotiable: dto.isPriceNegotiable ?? false,
        condition: dto.condition ?? 'USED',
        listingType: dto.listingType ?? 'SALE',
        dailyPrice: dto.dailyPrice ? new Prisma.Decimal(dto.dailyPrice) : undefined,
        weeklyPrice: dto.weeklyPrice ? new Prisma.Decimal(dto.weeklyPrice) : undefined,
        monthlyPrice: dto.monthlyPrice ? new Prisma.Decimal(dto.monthlyPrice) : undefined,
        minRentalDays: dto.minRentalDays,
        depositAmount: dto.depositAmount ? new Prisma.Decimal(dto.depositAmount) : undefined,
        kmLimitPerDay: dto.kmLimitPerDay,
        withDriver: dto.withDriver ?? false,
        deliveryAvailable: dto.deliveryAvailable ?? false,
        insuranceIncluded: dto.insuranceIncluded ?? false,
        cancellationPolicy: dto.cancellationPolicy,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
        availableTo: dto.availableTo ? new Date(dto.availableTo) : undefined,
        governorate: dto.governorate,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: 'ACTIVE',
        sellerId,
      },
      include: { seller: { select: this.sellerSelect }, images: true },
    });

    // Invalidate listings cache
    await this.redis.delPattern('listings:*');

    // Sync to Meilisearch (fire-and-forget)
    this.searchService.indexDocument(INDEXES.LISTINGS, {
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      description: listing.description,
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price: Number(listing.price),
      currency: listing.currency,
      mileage: listing.mileage,
      fuelType: listing.fuelType,
      transmission: listing.transmission,
      condition: listing.condition,
      listingType: listing.listingType,
      governorate: listing.governorate,
      city: listing.city,
      isPremium: listing.isPremium,
      status: listing.status,
      viewCount: listing.viewCount,
      imageUrl: listing.images?.[0]?.url || null,
      createdAt: listing.createdAt,
    }).catch(() => {});

    return listing;
  }

  async findAll(query: QueryListingsDto) {
    // Generate cache key from query
    const cacheKey = `listings:${JSON.stringify(query)}`;
    
    // Try to get from cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { make: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.make) where.make = { equals: query.make, mode: 'insensitive' };
    if (query.model) where.model = { equals: query.model, mode: 'insensitive' };
    if (query.fuelType) {
      const fuels = query.fuelType.split(',').filter(Boolean);
      if (fuels.length === 1) {
        where.fuelType = fuels[0] as any;
      } else if (fuels.length > 1) {
        where.fuelType = { in: fuels as any[] };
      }
    }
    if (query.transmission) where.transmission = query.transmission;
    if (query.condition) where.condition = query.condition;
    if (query.governorate) where.governorate = query.governorate;
    if (query.sellerId) where.sellerId = query.sellerId;
    if (query.listingType) where.listingType = query.listingType;
    where.status = query.status ?? 'ACTIVE';

    if (query.yearMin || query.yearMax) {
      where.year = {};
      if (query.yearMin) where.year.gte = query.yearMin;
      if (query.yearMax) where.year.lte = query.yearMax;
    }

    if (query.priceMin || query.priceMax) {
      where.price = {};
      if (query.priceMin) where.price.gte = new Prisma.Decimal(query.priceMin);
      if (query.priceMax) where.price.lte = new Prisma.Decimal(query.priceMax);
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { seller: { select: this.sellerSelect }, images: true },
      }),
      this.prisma.listing.count({ where }),
    ]);

    const result = {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `listing:${id}`;
    
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: this.sellerSelect }, images: true },
    });

    if (!listing) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    await this.redis.set(cacheKey, listing, 600); // 10 minutes

    return listing;
  }

  async findBySlug(slug: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: { seller: { select: this.sellerSelect }, images: true },
    });

    if (!listing) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    return listing;
  }

  async update(id: string, dto: UpdateListingDto, userId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');
    }

    const data: Prisma.ListingUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.make !== undefined) data.make = dto.make;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.mileage !== undefined) data.mileage = dto.mileage;
    if (dto.fuelType !== undefined) data.fuelType = dto.fuelType;
    if (dto.transmission !== undefined) data.transmission = dto.transmission;
    if (dto.bodyType !== undefined) data.bodyType = dto.bodyType;
    if (dto.exteriorColor !== undefined) data.exteriorColor = dto.exteriorColor;
    if (dto.interior !== undefined) data.interior = dto.interior;
    if (dto.engineSize !== undefined) data.engineSize = dto.engineSize;
    if (dto.horsepower !== undefined) data.horsepower = dto.horsepower;
    if (dto.doors !== undefined) data.doors = dto.doors;
    if (dto.seats !== undefined) data.seats = dto.seats;
    if (dto.driveType !== undefined) data.driveType = dto.driveType;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.isPriceNegotiable !== undefined) data.isPriceNegotiable = dto.isPriceNegotiable;
    if (dto.condition !== undefined) data.condition = dto.condition;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.governorate !== undefined) data.governorate = dto.governorate;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.listingType !== undefined) data.listingType = dto.listingType;
    if (dto.dailyPrice !== undefined) data.dailyPrice = dto.dailyPrice ? new Prisma.Decimal(dto.dailyPrice) : null;
    if (dto.weeklyPrice !== undefined) data.weeklyPrice = dto.weeklyPrice ? new Prisma.Decimal(dto.weeklyPrice) : null;
    if (dto.monthlyPrice !== undefined) data.monthlyPrice = dto.monthlyPrice ? new Prisma.Decimal(dto.monthlyPrice) : null;
    if (dto.minRentalDays !== undefined) data.minRentalDays = dto.minRentalDays;
    if (dto.depositAmount !== undefined) data.depositAmount = dto.depositAmount ? new Prisma.Decimal(dto.depositAmount) : null;
    if (dto.kmLimitPerDay !== undefined) data.kmLimitPerDay = dto.kmLimitPerDay;
    if (dto.withDriver !== undefined) data.withDriver = dto.withDriver;
    if (dto.deliveryAvailable !== undefined) data.deliveryAvailable = dto.deliveryAvailable;
    if (dto.insuranceIncluded !== undefined) data.insuranceIncluded = dto.insuranceIncluded;
    if (dto.cancellationPolicy !== undefined) data.cancellationPolicy = dto.cancellationPolicy;
    if (dto.availableFrom !== undefined) data.availableFrom = dto.availableFrom ? new Date(dto.availableFrom) : null;
    if (dto.availableTo !== undefined) data.availableTo = dto.availableTo ? new Date(dto.availableTo) : null;

    const updated = await this.prisma.listing.update({
      where: { id },
      data,
      include: { seller: { select: this.sellerSelect }, images: true },
    });

    // Invalidate cache
    await this.redis.delPattern('listings:*');
    await this.redis.del(`listing:${id}`);

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.LISTINGS, {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      description: updated.description,
      make: updated.make,
      model: updated.model,
      year: updated.year,
      price: Number(updated.price),
      currency: updated.currency,
      mileage: updated.mileage,
      fuelType: updated.fuelType,
      transmission: updated.transmission,
      condition: updated.condition,
      listingType: updated.listingType,
      governorate: updated.governorate,
      city: updated.city,
      isPremium: updated.isPremium,
      status: updated.status,
      viewCount: updated.viewCount,
      imageUrl: updated.images?.[0]?.url || null,
      createdAt: updated.createdAt,
    }).catch(() => {});

    return updated;
  }

  async remove(id: string, userId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('لا يمكنك حذف إعلان غيرك');
    }

    await this.prisma.listing.delete({ where: { id } });

    // Invalidate cache
    await this.redis.delPattern('listings:*');
    await this.redis.del(`listing:${id}`);

    // Remove from Meilisearch
    this.searchService.removeDocument(INDEXES.LISTINGS, id).catch(() => {});

    return { message: 'تم حذف الإعلان بنجاح' };
  }

  private readonly sellerSelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    governorate: true,
    isVerified: true,
    createdAt: true,
  };
}

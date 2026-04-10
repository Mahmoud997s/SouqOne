import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusListingDto } from './dto/create-bus-listing.dto';
import { QueryBusListingsDto } from './dto/query-bus-listings.dto';

const SELLER_SELECT = {
  id: true, username: true, displayName: true,
  avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true,
};

@Injectable()
export class BusesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateBusListingDto, userId: string) {
    const slug = this.generateSlug(dto.title);

    const bus = await this.prisma.busListing.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        busListingType: dto.busListingType,
        busType: dto.busType,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        capacity: dto.capacity,
        mileage: dto.mileage,
        fuelType: dto.fuelType,
        transmission: dto.transmission,
        condition: dto.condition ?? 'USED',
        features: dto.features ?? [],
        plateNumber: dto.plateNumber,
        price: dto.price != null ? new Prisma.Decimal(dto.price) : null,
        currency: dto.currency ?? 'OMR',
        isPriceNegotiable: dto.isPriceNegotiable ?? false,
        contractType: dto.contractType,
        contractClient: dto.contractClient,
        contractMonthly: dto.contractMonthly != null ? new Prisma.Decimal(dto.contractMonthly) : null,
        contractDuration: dto.contractDuration,
        contractExpiry: dto.contractExpiry ? new Date(dto.contractExpiry) : null,
        dailyPrice: dto.dailyPrice != null ? new Prisma.Decimal(dto.dailyPrice) : null,
        monthlyPrice: dto.monthlyPrice != null ? new Prisma.Decimal(dto.monthlyPrice) : null,
        minRentalDays: dto.minRentalDays,
        withDriver: dto.withDriver ?? false,
        deliveryAvailable: dto.deliveryAvailable ?? false,
        requestPassengers: dto.requestPassengers,
        requestRoute: dto.requestRoute,
        requestSchedule: dto.requestSchedule,
        governorate: dto.governorate,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        whatsapp: dto.whatsapp,
        userId,
      },
      include: {
        user: { select: SELLER_SELECT },
        images: true,
      },
    });

    return bus;
  }

  async findAll(query: QueryBusListingsDto) {
    const page = parseInt(query.page ?? '1');
    const limit = Math.min(parseInt(query.limit ?? '20'), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.BusListingWhereInput = { status: 'ACTIVE' };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { make: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.busListingType) where.busListingType = query.busListingType;
    if (query.busType) where.busType = query.busType;
    if (query.make) where.make = { contains: query.make, mode: 'insensitive' };
    if (query.governorate) where.governorate = query.governorate;

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = new Prisma.Decimal(query.minPrice);
      if (query.maxPrice) where.price.lte = new Prisma.Decimal(query.maxPrice);
    }

    if (query.minCapacity || query.maxCapacity) {
      where.capacity = {};
      if (query.minCapacity) where.capacity.gte = parseInt(query.minCapacity);
      if (query.maxCapacity) where.capacity.lte = parseInt(query.maxCapacity);
    }

    let orderBy: Prisma.BusListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { price: 'asc' };
    else if (query.sort === 'price_desc') orderBy = { price: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.busListing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),
      this.prisma.busListing.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const bus = await this.prisma.busListing.findUnique({
      where: { id },
      include: {
        user: { select: SELLER_SELECT },
        images: { orderBy: { order: 'asc' } },
      },
    });
    if (!bus) throw new NotFoundException('إعلان الحافلة غير موجود');

    await this.prisma.busListing.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return bus;
  }

  async findBySlug(slug: string) {
    const bus = await this.prisma.busListing.findUnique({
      where: { slug },
      include: {
        user: { select: SELLER_SELECT },
        images: { orderBy: { order: 'asc' } },
      },
    });
    if (!bus) throw new NotFoundException('إعلان الحافلة غير موجود');

    await this.prisma.busListing.update({ where: { slug }, data: { viewCount: { increment: 1 } } });
    return bus;
  }

  async myListings(userId: string) {
    return this.prisma.busListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateBusListingDto>) {
    const bus = await this.prisma.busListing.findUnique({ where: { id } });
    if (!bus) throw new NotFoundException('إعلان الحافلة غير موجود');
    if (bus.userId !== userId) throw new ForbiddenException('غير مصرح لك بتعديل هذا الإعلان');

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.busListingType !== undefined) data.busListingType = dto.busListingType;
    if (dto.busType !== undefined) data.busType = dto.busType;
    if (dto.make !== undefined) data.make = dto.make;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.capacity !== undefined) data.capacity = dto.capacity;
    if (dto.mileage !== undefined) data.mileage = dto.mileage;
    if (dto.fuelType !== undefined) data.fuelType = dto.fuelType;
    if (dto.transmission !== undefined) data.transmission = dto.transmission;
    if (dto.condition !== undefined) data.condition = dto.condition;
    if (dto.features !== undefined) data.features = dto.features;
    if (dto.plateNumber !== undefined) data.plateNumber = dto.plateNumber;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.isPriceNegotiable !== undefined) data.isPriceNegotiable = dto.isPriceNegotiable;
    if (dto.contractType !== undefined) data.contractType = dto.contractType;
    if (dto.contractClient !== undefined) data.contractClient = dto.contractClient;
    if (dto.contractMonthly !== undefined) data.contractMonthly = new Prisma.Decimal(dto.contractMonthly);
    if (dto.contractDuration !== undefined) data.contractDuration = dto.contractDuration;
    if (dto.contractExpiry !== undefined) data.contractExpiry = new Date(dto.contractExpiry);
    if (dto.dailyPrice !== undefined) data.dailyPrice = new Prisma.Decimal(dto.dailyPrice);
    if (dto.monthlyPrice !== undefined) data.monthlyPrice = new Prisma.Decimal(dto.monthlyPrice);
    if (dto.minRentalDays !== undefined) data.minRentalDays = dto.minRentalDays;
    if (dto.withDriver !== undefined) data.withDriver = dto.withDriver;
    if (dto.deliveryAvailable !== undefined) data.deliveryAvailable = dto.deliveryAvailable;
    if (dto.requestPassengers !== undefined) data.requestPassengers = dto.requestPassengers;
    if (dto.requestRoute !== undefined) data.requestRoute = dto.requestRoute;
    if (dto.requestSchedule !== undefined) data.requestSchedule = dto.requestSchedule;
    if (dto.governorate !== undefined) data.governorate = dto.governorate;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.contactPhone !== undefined) data.contactPhone = dto.contactPhone;
    if (dto.whatsapp !== undefined) data.whatsapp = dto.whatsapp;

    return this.prisma.busListing.update({
      where: { id },
      data,
      include: {
        user: { select: SELLER_SELECT },
        images: { orderBy: { order: 'asc' } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const bus = await this.prisma.busListing.findUnique({ where: { id } });
    if (!bus) throw new NotFoundException('إعلان الحافلة غير موجود');
    if (bus.userId !== userId) throw new ForbiddenException('غير مصرح لك بحذف هذا الإعلان');

    await this.prisma.busListing.delete({ where: { id } });
    return { message: 'تم حذف الإعلان بنجاح' };
  }

  async addImages(id: string, userId: string, urls: string[]) {
    const bus = await this.prisma.busListing.findUnique({ where: { id } });
    if (!bus) throw new NotFoundException('إعلان الحافلة غير موجود');
    if (bus.userId !== userId) throw new ForbiddenException('غير مصرح');

    const existing = await this.prisma.busListingImage.count({ where: { busListingId: id } });

    const images = await Promise.all(
      urls.map((url, i) =>
        this.prisma.busListingImage.create({
          data: {
            url,
            order: existing + i,
            isPrimary: existing === 0 && i === 0,
            busListingId: id,
          },
        }),
      ),
    );

    return images;
  }

  async removeImage(imageId: string, userId: string) {
    const image = await this.prisma.busListingImage.findUnique({
      where: { id: imageId },
      include: { busListing: { select: { userId: true } } },
    });
    if (!image) throw new NotFoundException('الصورة غير موجودة');
    if (image.busListing.userId !== userId) throw new ForbiddenException('غير مصرح');

    await this.prisma.busListingImage.delete({ where: { id: imageId } });
    return { message: 'تم حذف الصورة' };
  }
}

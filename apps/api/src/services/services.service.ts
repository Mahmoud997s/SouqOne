import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService, INDEXES } from '../search/search.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServicesDto } from './dto/query-services.dto';

@Injectable()
export class ServicesService {
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

  async create(dto: CreateServiceDto, userId: string) {
    const slug = this.generateSlug(dto.title);

    const item = await this.prisma.carService.create({
      data: {
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
      },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }, images: true },
    });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.SERVICES, {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      serviceType: item.serviceType, providerName: item.providerName, providerType: item.providerType,
      priceFrom: item.priceFrom ? Number(item.priceFrom) : null, currency: item.currency,
      governorate: item.governorate, city: item.city, isHomeService: item.isHomeService,
      status: item.status, imageUrl: item.images?.[0]?.url || null, createdAt: item.createdAt,
    }).catch(() => {});

    return item;
  }

  async findAll(query: QueryServicesDto) {
    const page = parseInt(query.page ?? '1');
    const limit = Math.min(parseInt(query.limit ?? '20'), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.CarServiceWhereInput = { status: 'ACTIVE' };

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

    const [items, total] = await Promise.all([
      this.prisma.carService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),
      this.prisma.carService.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const service = await this.prisma.carService.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true } },
        images: { orderBy: { order: 'asc' } },
      },
    });
    if (!service) throw new NotFoundException('الخدمة غير موجودة');
    await this.prisma.carService.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return service;
  }

  async myServices(userId: string) {
    return this.prisma.carService.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateServiceDto>) {
    const service = await this.prisma.carService.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('الخدمة غير موجودة');
    if (service.userId !== userId) throw new ForbiddenException('غير مصرح لك بتعديل هذا الإعلان');

    const data: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(dto)) {
      if (val !== undefined) {
        if (key === 'priceFrom' || key === 'priceTo') {
          data[key] = new Prisma.Decimal(val as number);
        } else {
          data[key] = val;
        }
      }
    }
    const updated = await this.prisma.carService.update({ where: { id }, data, include: { images: { take: 1, orderBy: { order: 'asc' } } } });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.SERVICES, {
      id: updated.id, title: updated.title, slug: updated.slug, description: updated.description,
      serviceType: updated.serviceType, providerName: updated.providerName, providerType: updated.providerType,
      priceFrom: updated.priceFrom ? Number(updated.priceFrom) : null, currency: updated.currency,
      governorate: updated.governorate, city: updated.city, isHomeService: updated.isHomeService,
      status: updated.status, imageUrl: updated.images?.[0]?.url || null, createdAt: updated.createdAt,
    }).catch(() => {});

    return updated;
  }

  async remove(id: string, userId: string) {
    const service = await this.prisma.carService.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('الخدمة غير موجودة');
    if (service.userId !== userId) throw new ForbiddenException('غير مصرح لك بحذف هذا الإعلان');
    await this.prisma.carService.delete({ where: { id } });

    // Clean up orphaned conversations & favorites
    await this.prisma.cleanupPolymorphicOrphans('CAR_SERVICE', id);

    // Remove from Meilisearch
    this.searchService.removeDocument(INDEXES.SERVICES, id).catch(() => {});

    return { message: 'تم حذف الإعلان بنجاح' };
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService, INDEXES } from '../search/search.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { QueryTransportDto } from './dto/query-transport.dto';

@Injectable()
export class TransportService {
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

  async create(dto: CreateTransportDto, userId: string) {
    const slug = this.generateSlug(dto.title);

    const item = await this.prisma.transportService.create({
      data: {
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
      },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }, images: true },
    });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.TRANSPORT, {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      transportType: item.transportType, providerName: item.providerName, providerType: item.providerType,
      basePrice: item.basePrice ? Number(item.basePrice) : null, currency: item.currency,
      governorate: item.governorate, city: item.city, coverageAreas: item.coverageAreas,
      hasInsurance: item.hasInsurance, hasTracking: item.hasTracking, status: item.status,
      imageUrl: item.images?.[0]?.url || null, createdAt: item.createdAt,
    }).catch(() => {});

    return item;
  }

  async findAll(query: QueryTransportDto) {
    const page = parseInt(query.page ?? '1');
    const limit = Math.min(parseInt(query.limit ?? '20'), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.TransportServiceWhereInput = { status: 'ACTIVE' };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.transportType) where.transportType = query.transportType;
    if (query.providerType) where.providerType = query.providerType;
    if (query.governorate) where.governorate = query.governorate;

    const [items, total] = await Promise.all([
      this.prisma.transportService.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      }),
      this.prisma.transportService.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.transportService.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true } },
        images: { orderBy: { order: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('خدمة النقل غير موجودة');
    await this.prisma.transportService.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  async myTransport(userId: string) {
    return this.prisma.transportService.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateTransportDto>) {
    const item = await this.prisma.transportService.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('خدمة النقل غير موجودة');
    if (item.userId !== userId) throw new ForbiddenException('غير مصرح لك بتعديل هذا الإعلان');

    const data: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(dto)) {
      if (val !== undefined) {
        if (key === 'basePrice' || key === 'pricePerKm') {
          data[key] = new Prisma.Decimal(val as number);
        } else {
          data[key] = val;
        }
      }
    }
    const updated = await this.prisma.transportService.update({ where: { id }, data, include: { images: { take: 1, orderBy: { order: 'asc' } } } });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.TRANSPORT, {
      id: updated.id, title: updated.title, slug: updated.slug, description: updated.description,
      transportType: updated.transportType, providerName: updated.providerName, providerType: updated.providerType,
      basePrice: updated.basePrice ? Number(updated.basePrice) : null, currency: updated.currency,
      governorate: updated.governorate, city: updated.city, coverageAreas: updated.coverageAreas,
      hasInsurance: updated.hasInsurance, hasTracking: updated.hasTracking, status: updated.status,
      imageUrl: updated.images?.[0]?.url || null, createdAt: updated.createdAt,
    }).catch(() => {});

    return updated;
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.transportService.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('خدمة النقل غير موجودة');
    if (item.userId !== userId) throw new ForbiddenException('غير مصرح لك بحذف هذا الإعلان');
    await this.prisma.transportService.delete({ where: { id } });

    // Clean up orphaned conversations & favorites
    await this.prisma.cleanupPolymorphicOrphans('TRANSPORT', id);

    // Remove from Meilisearch
    this.searchService.removeDocument(INDEXES.TRANSPORT, id).catch(() => {});

    return { message: 'تم حذف الإعلان بنجاح' };
  }
}

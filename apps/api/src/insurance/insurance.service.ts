import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService, INDEXES } from '../search/search.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { QueryInsuranceDto } from './dto/query-insurance.dto';

@Injectable()
export class InsuranceService {
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

  async create(dto: CreateInsuranceDto, userId: string) {
    const slug = this.generateSlug(dto.title);

    const item = await this.prisma.insuranceOffer.create({
      data: {
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
      },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.INSURANCE, {
      id: item.id, title: item.title, slug: item.slug, description: item.description,
      offerType: item.offerType, providerName: item.providerName, coverageType: item.coverageType,
      priceFrom: item.priceFrom ? Number(item.priceFrom) : null, currency: item.currency,
      governorate: item.governorate, status: item.status, createdAt: item.createdAt,
    }).catch(() => {});

    return item;
  }

  async findAll(query: QueryInsuranceDto) {
    const page = parseInt(query.page ?? '1');
    const limit = Math.min(parseInt(query.limit ?? '20'), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.InsuranceOfferWhereInput = { status: 'ACTIVE' };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { providerName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.offerType) where.offerType = query.offerType;
    if (query.governorate) where.governorate = query.governorate;

    const [items, total] = await Promise.all([
      this.prisma.insuranceOffer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.insuranceOffer.count({ where }),
    ]);

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.insuranceOffer.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true } },
      },
    });
    if (!item) throw new NotFoundException('العرض غير موجود');
    await this.prisma.insuranceOffer.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  async myOffers(userId: string) {
    return this.prisma.insuranceOffer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateInsuranceDto>) {
    const item = await this.prisma.insuranceOffer.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('العرض غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('غير مصرح لك بتعديل هذا الإعلان');

    const data: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(dto)) {
      if (val !== undefined) {
        if (key === 'priceFrom') {
          data[key] = new Prisma.Decimal(val as number);
        } else {
          data[key] = val;
        }
      }
    }
    const updated = await this.prisma.insuranceOffer.update({ where: { id }, data });

    // Sync to Meilisearch
    this.searchService.indexDocument(INDEXES.INSURANCE, {
      id: updated.id, title: updated.title, slug: updated.slug, description: updated.description,
      offerType: updated.offerType, providerName: updated.providerName, coverageType: updated.coverageType,
      priceFrom: updated.priceFrom ? Number(updated.priceFrom) : null, currency: updated.currency,
      governorate: updated.governorate, status: updated.status, createdAt: updated.createdAt,
    }).catch(() => {});

    return updated;
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.insuranceOffer.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('العرض غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('غير مصرح لك بحذف هذا الإعلان');
    await this.prisma.insuranceOffer.delete({ where: { id } });

    // Clean up orphaned conversations & favorites
    await this.prisma.cleanupPolymorphicOrphans('INSURANCE', id);

    // Remove from Meilisearch
    this.searchService.removeDocument(INDEXES.INSURANCE, id).catch(() => {});

    return { message: 'تم حذف الإعلان بنجاح' };
  }
}

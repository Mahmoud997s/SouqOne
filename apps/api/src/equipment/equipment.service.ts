import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentListingDto } from './dto/create-equipment-listing.dto';
import { QueryEquipmentListingsDto } from './dto/query-equipment-listings.dto';
import { CreateEquipmentRequestDto } from './dto/create-equipment-request.dto';
import { QueryEquipmentRequestsDto } from './dto/query-equipment-requests.dto';
import { CreateEquipmentBidDto } from './dto/create-equipment-bid.dto';
import { CreateOperatorListingDto } from './dto/create-operator-listing.dto';
import { QueryOperatorListingsDto } from './dto/query-operator-listings.dto';

const USER_SELECT = {
  id: true, username: true, displayName: true,
  avatarUrl: true, phone: true, governorate: true, isVerified: true, createdAt: true,
};

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  private slug(title: string): string {
    const base = title.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-').replace(/^-|-$/g, '');
    return `${base}-${Date.now().toString(36)}`;
  }

  // ═══════════════════════════════════════
  // Equipment Listings
  // ═══════════════════════════════════════

  async createListing(dto: CreateEquipmentListingDto, userId: string) {
    return this.prisma.equipmentListing.create({
      data: {
        title: dto.title,
        slug: this.slug(dto.title),
        description: dto.description,
        equipmentType: dto.equipmentType as any,
        listingType: dto.listingType as any,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        condition: (dto.condition as any) ?? 'USED',
        capacity: dto.capacity,
        power: dto.power,
        weight: dto.weight,
        hoursUsed: dto.hoursUsed,
        features: dto.features ?? [],
        price: dto.price != null ? new Prisma.Decimal(dto.price) : null,
        dailyPrice: dto.dailyPrice != null ? new Prisma.Decimal(dto.dailyPrice) : null,
        weeklyPrice: dto.weeklyPrice != null ? new Prisma.Decimal(dto.weeklyPrice) : null,
        monthlyPrice: dto.monthlyPrice != null ? new Prisma.Decimal(dto.monthlyPrice) : null,
        currency: dto.currency ?? 'OMR',
        isPriceNegotiable: dto.isPriceNegotiable ?? false,
        withOperator: dto.withOperator ?? false,
        deliveryAvailable: dto.deliveryAvailable ?? false,
        minRentalDays: dto.minRentalDays,
        governorate: dto.governorate,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        whatsapp: dto.whatsapp,
        userId,
      },
      include: { user: { select: USER_SELECT }, images: true },
    });
  }

  async findAllListings(q: QueryEquipmentListingsDto) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 20, 50);
    const where: Prisma.EquipmentListingWhereInput = { status: 'ACTIVE' };
    if (q.equipmentType) where.equipmentType = q.equipmentType as any;
    if (q.listingType) where.listingType = q.listingType as any;
    if (q.governorate) where.governorate = q.governorate;
    if (q.search) where.title = { contains: q.search, mode: 'insensitive' };

    const orderBy: Prisma.EquipmentListingOrderByWithRelationInput =
      q.sortBy === 'price_asc' ? { price: 'asc' } :
      q.sortBy === 'price_desc' ? { price: 'desc' } :
      q.sortBy === 'oldest' ? { createdAt: 'asc' } :
      { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.equipmentListing.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { user: { select: USER_SELECT }, images: { orderBy: { order: 'asc' }, take: 1 } },
      }),
      this.prisma.equipmentListing.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneListing(id: string) {
    const item = await this.prisma.equipmentListing.findUnique({
      where: { id }, include: { user: { select: USER_SELECT }, images: { orderBy: { order: 'asc' } } },
    });
    if (!item) throw new NotFoundException('الإعلان غير موجود');
    this.prisma.equipmentListing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    return item;
  }

  async findListingBySlug(slug: string) {
    const item = await this.prisma.equipmentListing.findUnique({
      where: { slug }, include: { user: { select: USER_SELECT }, images: { orderBy: { order: 'asc' } } },
    });
    if (!item) throw new NotFoundException('الإعلان غير موجود');
    this.prisma.equipmentListing.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    return item;
  }

  async myListings(userId: string) {
    return this.prisma.equipmentListing.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    });
  }

  async updateListing(id: string, userId: string, dto: Partial<CreateEquipmentListingDto>) {
    const item = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الإعلان غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');
    const data: any = { ...dto };
    for (const k of ['price','dailyPrice','weeklyPrice','monthlyPrice']) {
      if (data[k] != null) data[k] = new Prisma.Decimal(data[k]);
    }
    return this.prisma.equipmentListing.update({ where: { id }, data, include: { user: { select: USER_SELECT }, images: true } });
  }

  async removeListing(id: string, userId: string) {
    const item = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الإعلان غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك حذف إعلان غيرك');
    await this.prisma.equipmentListing.delete({ where: { id } });
    return { deleted: true };
  }

  async addListingImages(id: string, userId: string, urls: string[]) {
    const item = await this.prisma.equipmentListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الإعلان غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');
    const max = await this.prisma.equipmentListingImage.aggregate({ where: { equipmentListingId: id }, _max: { order: true } });
    let order = (max._max.order ?? -1) + 1;
    const count = await this.prisma.equipmentListingImage.count({ where: { equipmentListingId: id } });
    const images = await Promise.all(
      urls.map((url, i) =>
        this.prisma.equipmentListingImage.create({
          data: { url, order: order + i, isPrimary: count === 0 && i === 0, equipmentListingId: id },
        }),
      ),
    );
    return images;
  }

  async removeListingImage(imageId: string, userId: string) {
    const img = await this.prisma.equipmentListingImage.findUnique({ where: { id: imageId }, include: { equipmentListing: true } });
    if (!img) throw new NotFoundException('الصورة غير موجودة');
    if (img.equipmentListing.userId !== userId) throw new ForbiddenException('لا يمكنك حذف صورة غيرك');
    await this.prisma.equipmentListingImage.delete({ where: { id: imageId } });
    return { deleted: true };
  }

  // ═══════════════════════════════════════
  // Equipment Requests
  // ═══════════════════════════════════════

  async createRequest(dto: CreateEquipmentRequestDto, userId: string) {
    return this.prisma.equipmentRequest.create({
      data: {
        title: dto.title,
        slug: this.slug(dto.title),
        description: dto.description,
        equipmentType: dto.equipmentType as any,
        quantity: dto.quantity ?? 1,
        budgetMin: dto.budgetMin != null ? new Prisma.Decimal(dto.budgetMin) : null,
        budgetMax: dto.budgetMax != null ? new Prisma.Decimal(dto.budgetMax) : null,
        currency: dto.currency ?? 'OMR',
        rentalDuration: dto.rentalDuration,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        withOperator: dto.withOperator ?? false,
        governorate: dto.governorate,
        city: dto.city,
        siteDetails: dto.siteDetails,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        whatsapp: dto.whatsapp,
        userId,
      },
      include: { user: { select: USER_SELECT }, bids: { include: { user: { select: USER_SELECT } } } },
    });
  }

  async findAllRequests(q: QueryEquipmentRequestsDto) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 20, 50);
    const where: Prisma.EquipmentRequestWhereInput = {};
    if (q.requestStatus) where.requestStatus = q.requestStatus as any;
    else where.requestStatus = 'OPEN';
    if (q.equipmentType) where.equipmentType = q.equipmentType as any;
    if (q.governorate) where.governorate = q.governorate;
    if (q.search) where.title = { contains: q.search, mode: 'insensitive' };

    const orderBy: Prisma.EquipmentRequestOrderByWithRelationInput =
      q.sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.equipmentRequest.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: {
          user: { select: USER_SELECT },
          _count: { select: { bids: true } },
        },
      }),
      this.prisma.equipmentRequest.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneRequest(id: string) {
    const item = await this.prisma.equipmentRequest.findUnique({
      where: { id },
      include: {
        user: { select: USER_SELECT },
        bids: { include: { user: { select: USER_SELECT } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!item) throw new NotFoundException('الطلب غير موجود');
    this.prisma.equipmentRequest.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    return item;
  }

  async myRequests(userId: string) {
    return this.prisma.equipmentRequest.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { _count: { select: { bids: true } } },
    });
  }

  async updateRequest(id: string, userId: string, dto: Partial<CreateEquipmentRequestDto> & { requestStatus?: string }) {
    const item = await this.prisma.equipmentRequest.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الطلب غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك تعديل طلب غيرك');
    const data: any = { ...dto };
    for (const k of ['budgetMin', 'budgetMax']) {
      if (data[k] != null) data[k] = new Prisma.Decimal(data[k]);
    }
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.equipmentRequest.update({
      where: { id }, data,
      include: { user: { select: USER_SELECT }, bids: { include: { user: { select: USER_SELECT } } } },
    });
  }

  async removeRequest(id: string, userId: string) {
    const item = await this.prisma.equipmentRequest.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('الطلب غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك حذف طلب غيرك');
    await this.prisma.equipmentRequest.delete({ where: { id } });
    return { deleted: true };
  }

  // ═══════════════════════════════════════
  // Bids
  // ═══════════════════════════════════════

  async createBid(requestId: string, dto: CreateEquipmentBidDto, userId: string) {
    const req = await this.prisma.equipmentRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('الطلب غير موجود');
    if (req.userId === userId) throw new BadRequestException('لا يمكنك تقديم عرض على طلبك');
    if (req.requestStatus !== 'OPEN' && req.requestStatus !== 'IN_PROGRESS')
      throw new BadRequestException('الطلب مغلق');

    const existing = await this.prisma.equipmentBid.findFirst({
      where: { requestId, userId, bidStatus: 'PENDING' },
    });
    if (existing) throw new BadRequestException('لديك عرض قائم بالفعل على هذا الطلب');

    const bid = await this.prisma.equipmentBid.create({
      data: {
        price: new Prisma.Decimal(dto.price),
        currency: dto.currency ?? 'OMR',
        availability: dto.availability,
        notes: dto.notes,
        withOperator: dto.withOperator ?? false,
        requestId,
        userId,
      },
      include: { user: { select: USER_SELECT } },
    });

    if (req.requestStatus === 'OPEN') {
      await this.prisma.equipmentRequest.update({ where: { id: requestId }, data: { requestStatus: 'IN_PROGRESS' } });
    }

    return bid;
  }

  async acceptBid(requestId: string, bidId: string, userId: string) {
    const req = await this.prisma.equipmentRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('الطلب غير موجود');
    if (req.userId !== userId) throw new ForbiddenException('فقط صاحب الطلب يمكنه قبول العروض');

    const bid = await this.prisma.equipmentBid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) throw new NotFoundException('العرض غير موجود');

    await this.prisma.$transaction([
      this.prisma.equipmentBid.update({ where: { id: bidId }, data: { bidStatus: 'ACCEPTED' } }),
      this.prisma.equipmentBid.updateMany({
        where: { requestId, id: { not: bidId }, bidStatus: 'PENDING' },
        data: { bidStatus: 'REJECTED' },
      }),
      this.prisma.equipmentRequest.update({ where: { id: requestId }, data: { requestStatus: 'CLOSED' } }),
    ]);

    return this.prisma.equipmentBid.findUnique({ where: { id: bidId }, include: { user: { select: USER_SELECT } } });
  }

  async rejectBid(requestId: string, bidId: string, userId: string) {
    const req = await this.prisma.equipmentRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('الطلب غير موجود');
    if (req.userId !== userId) throw new ForbiddenException('فقط صاحب الطلب يمكنه رفض العروض');

    const bid = await this.prisma.equipmentBid.findUnique({ where: { id: bidId } });
    if (!bid || bid.requestId !== requestId) throw new NotFoundException('العرض غير موجود');

    return this.prisma.equipmentBid.update({ where: { id: bidId }, data: { bidStatus: 'REJECTED' }, include: { user: { select: USER_SELECT } } });
  }

  // ═══════════════════════════════════════
  // Operator Listings
  // ═══════════════════════════════════════

  async createOperator(dto: CreateOperatorListingDto, userId: string) {
    return this.prisma.operatorListing.create({
      data: {
        title: dto.title,
        slug: this.slug(dto.title),
        description: dto.description,
        operatorType: dto.operatorType as any,
        specializations: dto.specializations ?? [],
        experienceYears: dto.experienceYears,
        equipmentTypes: (dto.equipmentTypes ?? []) as any,
        certifications: dto.certifications ?? [],
        dailyRate: dto.dailyRate != null ? new Prisma.Decimal(dto.dailyRate) : null,
        hourlyRate: dto.hourlyRate != null ? new Prisma.Decimal(dto.hourlyRate) : null,
        currency: dto.currency ?? 'OMR',
        isPriceNegotiable: dto.isPriceNegotiable ?? false,
        governorate: dto.governorate,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        contactPhone: dto.contactPhone,
        whatsapp: dto.whatsapp,
        userId,
      },
      include: { user: { select: USER_SELECT } },
    });
  }

  async findAllOperators(q: QueryOperatorListingsDto) {
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 20, 50);
    const where: Prisma.OperatorListingWhereInput = { status: 'ACTIVE' };
    if (q.operatorType) where.operatorType = q.operatorType as any;
    if (q.governorate) where.governorate = q.governorate;
    if (q.search) where.title = { contains: q.search, mode: 'insensitive' };

    const orderBy: Prisma.OperatorListingOrderByWithRelationInput = { createdAt: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.operatorListing.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { user: { select: USER_SELECT } },
      }),
      this.prisma.operatorListing.count({ where }),
    ]);
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneOperator(id: string) {
    const item = await this.prisma.operatorListing.findUnique({
      where: { id }, include: { user: { select: USER_SELECT } },
    });
    if (!item) throw new NotFoundException('إعلان المشغل غير موجود');
    this.prisma.operatorListing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    return item;
  }

  async myOperators(userId: string) {
    return this.prisma.operatorListing.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async updateOperator(id: string, userId: string, dto: Partial<CreateOperatorListingDto>) {
    const item = await this.prisma.operatorListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('إعلان المشغل غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك تعديل إعلان غيرك');
    const data: any = { ...dto };
    for (const k of ['dailyRate', 'hourlyRate']) {
      if (data[k] != null) data[k] = new Prisma.Decimal(data[k]);
    }
    return this.prisma.operatorListing.update({ where: { id }, data, include: { user: { select: USER_SELECT } } });
  }

  async removeOperator(id: string, userId: string) {
    const item = await this.prisma.operatorListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('إعلان المشغل غير موجود');
    if (item.userId !== userId) throw new ForbiddenException('لا يمكنك حذف إعلان غيرك');
    await this.prisma.operatorListing.delete({ where: { id } });
    return { deleted: true };
  }
}

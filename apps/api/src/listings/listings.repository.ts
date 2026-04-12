import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeImages } from '../common/utils/image-url.util';

const SELLER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  governorate: true,
  isVerified: true,
  createdAt: true,
};

const DEFAULT_INCLUDE = {
  seller: { select: SELLER_SELECT },
  images: true,
} as const;

@Injectable()
export class ListingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ListingCreateInput) {
    const listing = await this.prisma.listing.create({
      data,
      include: DEFAULT_INCLUDE,
    });
    return normalizeImages(listing);
  }

  async findMany(
    where: Prisma.ListingWhereInput,
    orderBy: Prisma.ListingOrderByWithRelationInput,
    skip: number,
    take: number,
  ) {
    const [items, count] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where, skip, take, orderBy,
        include: DEFAULT_INCLUDE,
      }),
      this.prisma.listing.count({ where }),
    ]);
    return [items.map(normalizeImages), count] as const;
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: DEFAULT_INCLUDE,
    });
    return listing ? normalizeImages(listing) : null;
  }

  async findBySlug(slug: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: DEFAULT_INCLUDE,
    });
    return listing ? normalizeImages(listing) : null;
  }

  async update(id: string, data: Prisma.ListingUpdateInput) {
    const listing = await this.prisma.listing.update({
      where: { id },
      data,
      include: DEFAULT_INCLUDE,
    });
    return normalizeImages(listing);
  }

  async delete(id: string) {
    return this.prisma.listing.delete({ where: { id } });
  }

  async incrementViewCount(id: string) {
    return this.prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
}

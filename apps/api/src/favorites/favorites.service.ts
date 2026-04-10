import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(
    entityType: string,
    entityId: string,
    userId: string,
  ) {
    // Validate entity exists
    const entityTitle = await this.resolveEntityTitle(entityType, entityId);
    if (!entityTitle) {
      throw new NotFoundException('العنصر غير موجود');
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_entityType_entityId: { userId, entityType, entityId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: {
        userId,
        entityType,
        entityId,
        // Keep listingId populated for LISTING type (backward compat)
        ...(entityType === 'LISTING' ? { listingId: entityId } : {}),
      },
    });

    // Notify owner for listings
    if (entityType === 'LISTING') {
      const listing = await this.prisma.listing.findUnique({
        where: { id: entityId },
        select: { sellerId: true, title: true },
      });
      if (listing && listing.sellerId !== userId) {
        await this.prisma.notification.create({
          data: {
            type: 'LISTING_FAVORITED',
            title: 'إعلانك أُعجب به',
            body: `أحد المستخدمين أضاف "${listing.title}" للمفضلة`,
            userId: listing.sellerId,
            data: { listingId: entityId },
          },
        });
      }
    }

    return { favorited: true };
  }

  async getUserFavorites(
    userId: string,
    entityType?: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      ...(entityType ? { entityType } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.favorite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              images: { take: 1, orderBy: { order: 'asc' } },
              seller: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.favorite.count({ where }),
    ]);

    // Enrich non-listing favorites with entity data
    const enriched = await Promise.all(
      items.map(async (fav) => {
        if (fav.entityType === 'LISTING' && fav.listing) {
          return {
            id: fav.id,
            entityType: fav.entityType,
            entityId: fav.entityId,
            createdAt: fav.createdAt,
            listing: fav.listing,
            entity: {
              id: fav.listing.id,
              title: fav.listing.title,
              image: fav.listing.images?.[0]?.url || null,
            },
          };
        }
        const entity = await this.resolveEntity(
          fav.entityType,
          fav.entityId,
        );
        return {
          id: fav.id,
          entityType: fav.entityType,
          entityId: fav.entityId,
          createdAt: fav.createdAt,
          listing: fav.listing,
          entity,
        };
      }),
    );

    return {
      items: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async checkFavorite(entityType: string, entityId: string, userId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: {
        userId_entityType_entityId: { userId, entityType, entityId },
      },
    });

    return { favorited: !!fav };
  }

  async getUserFavoriteIds(userId: string, entityType?: string) {
    const where = { userId, ...(entityType ? { entityType } : {}) };
    const favs = await this.prisma.favorite.findMany({
      where,
      select: { entityType: true, entityId: true },
    });
    return favs.map((f) => `${f.entityType}:${f.entityId}`);
  }

  private async resolveEntityTitle(
    entityType: string,
    entityId: string,
  ): Promise<string | null> {
    try {
      switch (entityType) {
        case 'LISTING': {
          const r = await this.prisma.listing.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        case 'JOB': {
          const r = await this.prisma.driverJob.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        case 'SPARE_PART': {
          const r = await this.prisma.sparePart.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        case 'CAR_SERVICE': {
          const r = await this.prisma.carService.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        case 'TRANSPORT': {
          const r = await this.prisma.transportService.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        case 'TRIP': {
          const r = await this.prisma.tripService.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        case 'INSURANCE': {
          const r = await this.prisma.insuranceOffer.findUnique({ where: { id: entityId }, select: { title: true } });
          return r?.title || null;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  private async resolveEntity(
    entityType: string,
    entityId: string,
  ): Promise<{ id: string; title: string; image: string | null } | null> {
    try {
      switch (entityType) {
        case 'JOB': {
          const r = await this.prisma.driverJob.findUnique({ where: { id: entityId }, select: { id: true, title: true } });
          return r ? { id: r.id, title: r.title, image: null } : null;
        }
        case 'SPARE_PART': {
          const r = await this.prisma.sparePart.findUnique({
            where: { id: entityId },
            select: { id: true, title: true, images: { take: 1, orderBy: { order: 'asc' } } },
          });
          return r ? { id: r.id, title: r.title, image: (r.images as any)?.[0]?.url || null } : null;
        }
        case 'CAR_SERVICE': {
          const r = await this.prisma.carService.findUnique({
            where: { id: entityId },
            select: { id: true, title: true, images: { take: 1, orderBy: { order: 'asc' } } },
          });
          return r ? { id: r.id, title: r.title, image: (r.images as any)?.[0]?.url || null } : null;
        }
        case 'TRANSPORT': {
          const r = await this.prisma.transportService.findUnique({
            where: { id: entityId },
            select: { id: true, title: true, images: { take: 1, orderBy: { order: 'asc' } } },
          });
          return r ? { id: r.id, title: r.title, image: (r.images as any)?.[0]?.url || null } : null;
        }
        case 'TRIP': {
          const r = await this.prisma.tripService.findUnique({ where: { id: entityId }, select: { id: true, title: true } });
          return r ? { id: r.id, title: r.title, image: null } : null;
        }
        case 'INSURANCE': {
          const r = await this.prisma.insuranceOffer.findUnique({ where: { id: entityId }, select: { id: true, title: true } });
          return r ? { id: r.id, title: r.title, image: null } : null;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}

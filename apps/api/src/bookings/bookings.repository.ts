import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  governorate: true,
  isVerified: true,
  phone: true,
};

const FULL_INCLUDE = {
  listing: { include: { images: true } },
  renter: { select: USER_SELECT },
  owner: { select: USER_SELECT },
} as const;

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BookingCreateInput) {
    return this.prisma.booking.create({
      data,
      include: FULL_INCLUDE,
    });
  }

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: { include: { images: true, seller: { select: USER_SELECT } } },
        renter: { select: USER_SELECT },
        owner: { select: USER_SELECT },
      },
    });
  }

  async findByIdWithListing(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });
  }

  async findMyBookings(
    where: Prisma.BookingWhereInput,
    skip: number,
    take: number,
  ) {
    return this.prisma.$transaction([
      this.prisma.booking.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { include: { images: true } },
          owner: { select: USER_SELECT },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);
  }

  async findReceivedBookings(
    where: Prisma.BookingWhereInput,
    skip: number,
    take: number,
  ) {
    return this.prisma.$transaction([
      this.prisma.booking.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { include: { images: true } },
          renter: { select: USER_SELECT },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);
  }

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: FULL_INCLUDE,
    });
  }

  async findConflicting(listingId: string, startDate: Date, endDate: Date) {
    return this.prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });
  }

  async findActiveBookings(listingId: string) {
    return this.prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      },
      select: { startDate: true, endDate: true, status: true },
      orderBy: { startDate: 'asc' },
    });
  }
}

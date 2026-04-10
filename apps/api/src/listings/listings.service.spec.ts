import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const mockListing = {
  id: 'listing-1',
  title: 'تويوتا كامري 2024',
  slug: 'toyota-camry-2024-abc',
  sellerId: 'seller-1',
  make: 'Toyota',
  model: 'Camry',
  year: 2024,
  price: { toNumber: () => 12000 },
  status: 'ACTIVE',
};

const mockPrisma = {
  listing: {
    create: jest.fn().mockResolvedValue(mockListing),
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([mockListing]),
    count: jest.fn().mockResolvedValue(1),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((args) => Promise.all(args)),
};

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
};

describe('ListingsService', () => {
  let service: ListingsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  describe('create', () => {
    it('should create a listing and return it', async () => {
      const result = await service.create(
        {
          title: 'تويوتا كامري 2024',
          description: 'سيارة ممتازة',
          make: 'Toyota',
          model: 'Camry',
          year: 2024,
          price: 12000,
        } as any,
        'seller-1',
      );

      expect(result).toEqual(mockListing);
      expect(mockPrisma.listing.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return paginated listings', async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([[mockListing], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should use cached data if available', async () => {
      const cached = { items: [mockListing], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      mockRedis.get.mockResolvedValueOnce(cached);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(cached);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a listing by id', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);

      const result = await service.findOne('listing-1');
      expect(result.id).toBe('listing-1');
    });

    it('should throw NotFoundException for missing listing', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the listing if user is the seller', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.listing.delete.mockResolvedValue(mockListing);

      const result = await service.remove('listing-1', 'seller-1');
      expect(mockPrisma.listing.delete).toHaveBeenCalledWith({ where: { id: 'listing-1' } });
    });

    it('should throw ForbiddenException if user is not the seller', async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);

      await expect(service.remove('listing-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
});

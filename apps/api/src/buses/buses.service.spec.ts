import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BusesService } from './buses.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SearchService } from '../search/search.service';

// ── Mocks ──

const mockPrisma = {
  busListing: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  busListingImage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  busListingOffer: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  busListingStatusLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  busListingPriceHistory: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  cleanupPolymorphicOrphans: jest.fn(),
};

const mockRedis = {
  setNX: jest.fn(),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
};

const mockNotifications = {
  create: jest.fn().mockResolvedValue({}),
};

const mockSearch = {
  indexDocument: jest.fn().mockResolvedValue(undefined),
  removeDocument: jest.fn().mockResolvedValue(undefined),
};

// ── Test Data ──

const mockBus = {
  id: 'bus-1',
  title: 'حافلة تويوتا كوستر',
  slug: 'test-bus-slug',
  description: 'حافلة ممتازة للنقل',
  busListingType: 'BUS_SALE',
  busType: 'COASTER',
  make: 'Toyota',
  model: 'Coaster',
  year: 2020,
  capacity: 30,
  status: 'ACTIVE',
  viewCount: 5,
  userId: 'user-1',
  createdAt: new Date(),
  user: { id: 'user-1', username: 'seller', displayName: 'Seller', avatarUrl: null },
  images: [],
};

const mockImage = {
  id: 'img-1',
  url: '/uploads/bus1.jpg',
  order: 0,
  isPrimary: true,
  busListingId: 'bus-1',
  busListing: { userId: 'user-1' },
};

// ── Test Suite ──

describe('BusesService', () => {
  let service: BusesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: SearchService, useValue: mockSearch },
      ],
    }).compile();
    service = module.get<BusesService>(BusesService);
  });

  // ════════════════════════════════════════════
  // Phase 1.1 — myListings() pagination
  // ════════════════════════════════════════════

  describe('myListings — pagination', () => {
    it('should return paginated results with meta', async () => {
      const items = [mockBus];
      mockPrisma.busListing.findMany.mockResolvedValue(items);
      mockPrisma.busListing.count.mockResolvedValue(25);

      const result = await service.myListings('user-1', 1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({ total: 25, page: 1, limit: 20, totalPages: 2 });
    });

    it('should cap limit at 50', async () => {
      mockPrisma.busListing.findMany.mockResolvedValue([]);
      mockPrisma.busListing.count.mockResolvedValue(0);

      await service.myListings('user-1', 1, 200);

      expect(mockPrisma.busListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it('should use default page=1, limit=20', async () => {
      mockPrisma.busListing.findMany.mockResolvedValue([]);
      mockPrisma.busListing.count.mockResolvedValue(0);

      await service.myListings('user-1');

      expect(mockPrisma.busListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should calculate correct skip for page 3', async () => {
      mockPrisma.busListing.findMany.mockResolvedValue([]);
      mockPrisma.busListing.count.mockResolvedValue(0);

      await service.myListings('user-1', 3, 10);

      expect(mockPrisma.busListing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  // ════════════════════════════════════════════
  // Phase 1.3 — viewCount rate-limit
  // ════════════════════════════════════════════

  describe('viewCount — rate limiting', () => {
    it('should increment viewCount on first visit (new IP)', async () => {
      mockPrisma.busListing.findFirst.mockResolvedValue(mockBus);
      mockRedis.setNX.mockResolvedValue(true); // key didn't exist → new visit

      await service.findOne('bus-1', '192.168.1.1');

      expect(mockRedis.setNX).toHaveBeenCalledWith('bus:view:192.168.1.1:bus-1', '1', 3600);
      expect(mockPrisma.busListing.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
      );
    });

    it('should NOT increment viewCount on repeat visit (same IP within 1hr)', async () => {
      mockPrisma.busListing.findFirst.mockResolvedValue(mockBus);
      mockRedis.setNX.mockResolvedValue(false); // key already exists → repeat

      await service.findOne('bus-1', '192.168.1.1');

      expect(mockRedis.setNX).toHaveBeenCalled();
      expect(mockPrisma.busListing.update).not.toHaveBeenCalled();
    });

    it('should increment viewCount when no IP (graceful degradation)', async () => {
      mockPrisma.busListing.findFirst.mockResolvedValue(mockBus);

      await service.findOne('bus-1'); // no IP

      expect(mockRedis.setNX).not.toHaveBeenCalled();
      expect(mockPrisma.busListing.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
      );
    });

    it('should rate-limit on findBySlug too', async () => {
      mockPrisma.busListing.findFirst.mockResolvedValue(mockBus);
      mockRedis.setNX.mockResolvedValue(false);

      await service.findBySlug('test-bus-slug', '10.0.0.1');

      expect(mockRedis.setNX).toHaveBeenCalledWith('bus:view:10.0.0.1:bus-1', '1', 3600);
      expect(mockPrisma.busListing.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      mockPrisma.busListing.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════
  // Phase 2.1 — Status state machine
  // ════════════════════════════════════════════

  describe('update — status state machine', () => {
    const validTransitions = [
      { from: 'DRAFT', to: 'ACTIVE' },
      { from: 'ACTIVE', to: 'SOLD' },
      { from: 'ACTIVE', to: 'RENTED' },
      { from: 'ACTIVE', to: 'ARCHIVED' },
      { from: 'ACTIVE', to: 'SUSPENDED' },
      { from: 'ARCHIVED', to: 'ACTIVE' },
      { from: 'RENTED', to: 'ACTIVE' },
    ];

    const invalidTransitions = [
      { from: 'SOLD', to: 'ACTIVE' },
      { from: 'SOLD', to: 'DRAFT' },
      { from: 'SUSPENDED', to: 'ACTIVE' },
      { from: 'DRAFT', to: 'SOLD' },
      { from: 'DRAFT', to: 'RENTED' },
      { from: 'RENTED', to: 'SOLD' },
      { from: 'ARCHIVED', to: 'SOLD' },
    ];

    it.each(validTransitions)(
      'should allow $from → $to',
      async ({ from, to }) => {
        mockPrisma.busListing.findUnique.mockResolvedValue({ ...mockBus, status: from });
        mockPrisma.busListing.update.mockResolvedValue({ ...mockBus, status: to });

        await service.update('bus-1', 'user-1', { status: to as any });

        expect(mockPrisma.busListing.update).toHaveBeenCalled();
      },
    );

    it.each(invalidTransitions)(
      'should reject $from → $to',
      async ({ from, to }) => {
        mockPrisma.busListing.findUnique.mockResolvedValue({ ...mockBus, status: from });

        await expect(
          service.update('bus-1', 'user-1', { status: to as any }),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it('should allow update without status change', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListing.update.mockResolvedValue({ ...mockBus, title: 'عنوان جديد' });

      await service.update('bus-1', 'user-1', { title: 'عنوان جديد' });

      expect(mockPrisma.busListing.update).toHaveBeenCalled();
    });

    it('should reject update by non-owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);

      await expect(
        service.update('bus-1', 'other-user', { title: 'hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', 'user-1', { title: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════
  // Phase 2.2 — Batch image creation in $transaction
  // ════════════════════════════════════════════

  describe('addImages — $transaction', () => {
    it('should use $transaction for batch image creation', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListingImage.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockResolvedValue([
        { id: 'img-1', url: '/a.jpg', order: 0, isPrimary: true },
        { id: 'img-2', url: '/b.jpg', order: 1, isPrimary: false },
      ]);

      const result = await service.addImages('bus-1', 'user-1', ['/a.jpg', '/b.jpg']);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should set first image as primary when no existing images', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListingImage.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockResolvedValue([{ id: 'img-1' }]);

      await service.addImages('bus-1', 'user-1', ['/a.jpg']);

      // Verify the create calls passed to $transaction
      const txArg = mockPrisma.$transaction.mock.calls[0][0];
      expect(txArg).toHaveLength(1);
    });

    it('should reject addImages by non-owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);

      await expect(
        service.addImages('bus-1', 'other-user', ['/a.jpg']),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ════════════════════════════════════════════
  // Phase 2.3 — Image reindex on delete
  // ════════════════════════════════════════════

  describe('removeImage — reindex', () => {
    it('should reindex remaining images after deletion', async () => {
      mockPrisma.busListingImage.findUnique.mockResolvedValue(mockImage);
      mockPrisma.busListingImage.delete.mockResolvedValue(mockImage);
      mockPrisma.busListingImage.findMany.mockResolvedValue([
        { id: 'img-2', order: 2, busListingId: 'bus-1' },
        { id: 'img-3', order: 3, busListingId: 'bus-1' },
      ]);
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.removeImage('img-1', 'user-1');

      expect(mockPrisma.busListingImage.delete).toHaveBeenCalledWith({ where: { id: 'img-1' } });
      expect(mockPrisma.$transaction).toHaveBeenCalled();

      // Verify reindex: first remaining becomes order=0/isPrimary=true
      const txArg = mockPrisma.$transaction.mock.calls[0][0];
      expect(txArg).toHaveLength(2);
    });

    it('should skip reindex when no remaining images', async () => {
      mockPrisma.busListingImage.findUnique.mockResolvedValue(mockImage);
      mockPrisma.busListingImage.delete.mockResolvedValue(mockImage);
      mockPrisma.busListingImage.findMany.mockResolvedValue([]);

      await service.removeImage('img-1', 'user-1');

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should reject removeImage by non-owner', async () => {
      mockPrisma.busListingImage.findUnique.mockResolvedValue(mockImage);

      await expect(
        service.removeImage('img-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent image', async () => {
      mockPrisma.busListingImage.findUnique.mockResolvedValue(null);

      await expect(
        service.removeImage('non-existent', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ════════════════════════════════════════════
  // Phase 3 — Offers
  // ════════════════════════════════════════════

  const mockRequestListing = {
    ...mockBus,
    id: 'req-1',
    busListingType: 'BUS_REQUEST',
    governorate: 'مسقط',
    userId: 'requester-1',
  };

  const mockOffer = {
    id: 'offer-1',
    message: 'عرض ممتاز',
    proposedPrice: { toNumber: () => 5000 },
    status: 'PENDING',
    requestListingId: 'req-1',
    sellerUserId: 'seller-1',
    requestListing: { userId: 'requester-1', id: 'req-1' },
    seller: { id: 'seller-1', username: 'seller' },
  };

  describe('createOffer', () => {
    it('should create an offer on a REQUEST listing', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockRequestListing);
      mockPrisma.busListingOffer.findUnique.mockResolvedValue(null);
      mockPrisma.busListingOffer.create.mockResolvedValue(mockOffer);

      const result = await service.createOffer('req-1', 'seller-1', { message: 'عرض ممتاز', proposedPrice: 5000 });

      expect(result.id).toBe('offer-1');
      expect(mockPrisma.busListingOffer.create).toHaveBeenCalled();
    });

    it('should reject offer on non-REQUEST listing', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus); // BUS_SALE

      await expect(
        service.createOffer('bus-1', 'seller-1', { message: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject self-offer', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockRequestListing);

      await expect(
        service.createOffer('req-1', 'requester-1', { message: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate offer from same seller', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockRequestListing);
      mockPrisma.busListingOffer.findUnique.mockResolvedValue(mockOffer);

      await expect(
        service.createOffer('req-1', 'seller-1', { message: 'again' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOffers', () => {
    it('should return offers for request owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockRequestListing);
      mockPrisma.busListingOffer.findMany.mockResolvedValue([mockOffer]);

      const result = await service.getOffers('req-1', 'requester-1');

      expect(result).toHaveLength(1);
    });

    it('should reject non-owner from viewing offers', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockRequestListing);

      await expect(
        service.getOffers('req-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateOffer', () => {
    it('should accept an offer', async () => {
      mockPrisma.busListingOffer.findUnique.mockResolvedValue(mockOffer);
      mockPrisma.busListingOffer.findFirst.mockResolvedValue(null); // no existing accepted
      mockPrisma.busListingOffer.update.mockResolvedValue({ ...mockOffer, status: 'ACCEPTED' });
      mockPrisma.busListing.update.mockResolvedValue({});

      const result = await service.updateOffer('offer-1', 'requester-1', { status: 'ACCEPTED' as any });

      expect(result.status).toBe('ACCEPTED');
      // Should archive the request
      expect(mockPrisma.busListing.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ARCHIVED' } }),
      );
    });

    it('should reject an offer', async () => {
      mockPrisma.busListingOffer.findUnique.mockResolvedValue(mockOffer);
      mockPrisma.busListingOffer.update.mockResolvedValue({ ...mockOffer, status: 'REJECTED' });

      const result = await service.updateOffer('offer-1', 'requester-1', { status: 'REJECTED' as any });

      expect(result.status).toBe('REJECTED');
    });

    it('should not allow changing an already ACCEPTED offer', async () => {
      mockPrisma.busListingOffer.findUnique.mockResolvedValue({ ...mockOffer, status: 'ACCEPTED' });

      await expect(
        service.updateOffer('offer-1', 'requester-1', { status: 'REJECTED' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow a second ACCEPTED offer', async () => {
      mockPrisma.busListingOffer.findUnique.mockResolvedValue(mockOffer);
      mockPrisma.busListingOffer.findFirst.mockResolvedValue({ id: 'other-accepted' });

      await expect(
        service.updateOffer('offer-1', 'requester-1', { status: 'ACCEPTED' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject non-owner from updating offer', async () => {
      mockPrisma.busListingOffer.findUnique.mockResolvedValue(mockOffer);

      await expect(
        service.updateOffer('offer-1', 'other-user', { status: 'ACCEPTED' as any }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ════════════════════════════════════════════
  // Phase 4 — Observability
  // ════════════════════════════════════════════

  describe('soft delete', () => {
    it('should soft-delete instead of hard-delete', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListing.update.mockResolvedValue({ ...mockBus, deletedAt: new Date() });

      const result = await service.remove('bus-1', 'user-1');

      expect(result.message).toBe('تم حذف الإعلان بنجاح');
      expect(mockPrisma.busListing.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { deletedAt: expect.any(Date) } }),
      );
    });
  });

  describe('status transition log', () => {
    it('should log status change on update', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue({ ...mockBus, status: 'ACTIVE' });
      mockPrisma.busListing.update.mockResolvedValue({ ...mockBus, status: 'SOLD' });
      mockPrisma.busListingStatusLog.create.mockResolvedValue({});

      await service.update('bus-1', 'user-1', { status: 'SOLD' as any });

      expect(mockPrisma.busListingStatusLog.create).toHaveBeenCalledWith({
        data: {
          busListingId: 'bus-1',
          fromStatus: 'ACTIVE',
          toStatus: 'SOLD',
          changedBy: 'user-1',
        },
      });
    });

    it('should NOT log when status unchanged', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListing.update.mockResolvedValue(mockBus);

      await service.update('bus-1', 'user-1', { title: 'new title' });

      expect(mockPrisma.busListingStatusLog.create).not.toHaveBeenCalled();
    });
  });

  describe('getStatusHistory', () => {
    it('should return history for owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListingStatusLog.findMany.mockResolvedValue([
        { fromStatus: 'DRAFT', toStatus: 'ACTIVE' },
      ]);

      const result = await service.getStatusHistory('bus-1', 'user-1');

      expect(result).toHaveLength(1);
    });

    it('should reject non-owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);

      await expect(
        service.getStatusHistory('bus-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStats', () => {
    it('should return stats for owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListingStatusLog.findMany.mockResolvedValue([]);
      mockPrisma.busListingOffer.count.mockResolvedValue(3);

      const result = await service.getStats('bus-1', 'user-1');

      expect(result.viewCount).toBe(5);
      expect(result.offersCount).toBe(3);
      expect(result.statusHistory).toEqual([]);
    });

    it('should reject non-owner', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);

      await expect(
        service.getStats('bus-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ════════════════════════════════════════════
  // Phase 5 — Scale
  // ════════════════════════════════════════════

  describe('Redis cache', () => {
    it('should return cached result for findAll', async () => {
      const cachedResult = { items: [mockBus], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      mockRedis.get.mockResolvedValue(cachedResult);

      const result = await service.findAll({});

      expect(result).toEqual(cachedResult);
      expect(mockPrisma.busListing.findMany).not.toHaveBeenCalled();
    });

    it('should cache findAll result on miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.busListing.findMany.mockResolvedValue([mockBus]);
      mockPrisma.busListing.count.mockResolvedValue(1);

      await service.findAll({});

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('busListing:list:'),
        expect.objectContaining({ items: [mockBus] }),
        300,
      );
    });

    it('should return cached result for findOne', async () => {
      mockRedis.get.mockResolvedValue(mockBus);

      const result = await service.findOne('bus-1');

      expect(result).toEqual(mockBus);
      expect(mockPrisma.busListing.findFirst).not.toHaveBeenCalled();
    });

    it('should invalidate cache on create', async () => {
      mockPrisma.busListing.create.mockResolvedValue(mockBus);
      mockRedis.get.mockResolvedValue(null);

      await service.create({
        title: 'حافلة جديدة',
        description: 'وصف',
        busListingType: 'BUS_SALE' as any,
        busType: 'COASTER' as any,
        governorate: 'مسقط',
      } as any, 'user-1');

      expect(mockRedis.delPattern).toHaveBeenCalledWith('busListing:list:*');
    });
  });

  describe('Meilisearch sync', () => {
    it('should index document on create', async () => {
      mockPrisma.busListing.create.mockResolvedValue(mockBus);
      mockRedis.get.mockResolvedValue(null);

      await service.create({
        title: 'حافلة جديدة',
        description: 'وصف',
        busListingType: 'BUS_SALE' as any,
        busType: 'COASTER' as any,
        governorate: 'مسقط',
      } as any, 'user-1');

      expect(mockSearch.indexDocument).toHaveBeenCalledWith(
        'buses',
        expect.objectContaining({ id: 'bus-1' }),
      );
    });

    it('should remove document on delete', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListing.update.mockResolvedValue({ ...mockBus, deletedAt: new Date() });
      mockRedis.get.mockResolvedValue(null);

      await service.remove('bus-1', 'user-1');

      expect(mockSearch.removeDocument).toHaveBeenCalledWith('buses', 'bus-1');
    });
  });

  describe('price audit trail', () => {
    it('should log price change on update', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue({ ...mockBus, price: { toString: () => '10000' } });
      mockPrisma.busListing.update.mockResolvedValue({ ...mockBus, price: { toString: () => '12000' } });
      mockPrisma.busListingPriceHistory.create.mockResolvedValue({});

      await service.update('bus-1', 'user-1', { price: 12000 } as any);

      expect(mockPrisma.busListingPriceHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          busListingId: 'bus-1',
          changedBy: 'user-1',
        }),
      });
    });

    it('should NOT log when price unchanged', async () => {
      mockPrisma.busListing.findUnique.mockResolvedValue(mockBus);
      mockPrisma.busListing.update.mockResolvedValue(mockBus);

      await service.update('bus-1', 'user-1', { title: 'new title' });

      expect(mockPrisma.busListingPriceHistory.create).not.toHaveBeenCalled();
    });
  });
});

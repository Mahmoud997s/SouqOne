import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService } from '../search/search.service';

const mockPrisma = {
  tripService: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cleanupPolymorphicOrphans: jest.fn(),
};

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
};

const mockSearch = {
  indexDocument: jest.fn().mockResolvedValue(undefined),
  removeDocument: jest.fn().mockResolvedValue(undefined),
};

const mockItem = {
  id: 'trip-1', title: 'رحلة مسقط-صلالة', slug: 'test-slug', description: 'وصف',
  tripType: 'INTERCITY', scheduleType: 'DAILY', routeFrom: 'مسقط', routeTo: 'صلالة',
  providerName: 'شركة رحلات', currency: 'OMR', governorate: 'مسقط',
  status: 'ACTIVE', userId: 'user-1', viewCount: 0, createdAt: new Date(),
  user: { id: 'user-1', username: 'test', displayName: 'Test', avatarUrl: null },
};

describe('TripsService', () => {
  let service: TripsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: SearchService, useValue: mockSearch },
      ],
    }).compile();
    service = module.get<TripsService>(TripsService);
  });

  it('should create a trip listing', async () => {
    mockPrisma.tripService.create.mockResolvedValue(mockItem);
    const result = await service.create({
      title: 'رحلة مسقط-صلالة', description: 'وصف الرحلة بالتفصيل',
      tripType: 'INTERCITY' as any, scheduleType: 'DAILY' as any,
      routeFrom: 'مسقط', routeTo: 'صلالة', providerName: 'شركة رحلات', governorate: 'مسقط',
    } as any, 'user-1');
    expect(result.id).toBe('trip-1');
    expect(mockSearch.indexDocument).toHaveBeenCalled();
  });

  it('should rate-limit viewCount on findOne', async () => {
    mockPrisma.tripService.findUnique.mockResolvedValue(mockItem);
    mockRedis.get.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    await service.findOne('trip-1', '1.2.3.4');
    expect(mockPrisma.tripService.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
    );
  });

  it('should enforce owner check on remove', async () => {
    mockPrisma.tripService.findUnique.mockResolvedValue(mockItem);
    await expect(service.remove('trip-1', 'other-user')).rejects.toThrow(ForbiddenException);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService } from '../search/search.service';

const mockPrisma = {
  insuranceOffer: {
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
  id: 'ins-1', title: 'تأمين شامل', slug: 'test-slug', description: 'وصف',
  offerType: 'COMPREHENSIVE', providerName: 'شركة تأمين', coverageType: 'شامل',
  priceFrom: { toNumber: () => 100 }, currency: 'OMR', governorate: 'مسقط',
  status: 'ACTIVE', userId: 'user-1', viewCount: 0, createdAt: new Date(),
  user: { id: 'user-1', username: 'test', displayName: 'Test', avatarUrl: null },
};

describe('InsuranceService', () => {
  let service: InsuranceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: SearchService, useValue: mockSearch },
      ],
    }).compile();
    service = module.get<InsuranceService>(InsuranceService);
  });

  it('should create an insurance offer', async () => {
    mockPrisma.insuranceOffer.create.mockResolvedValue(mockItem);
    const result = await service.create({
      title: 'تأمين شامل', description: 'وصف العرض بالتفصيل',
      offerType: 'COMPREHENSIVE' as any, providerName: 'شركة تأمين',
    } as any, 'user-1');
    expect(result.id).toBe('ins-1');
    expect(mockSearch.indexDocument).toHaveBeenCalled();
  });

  it('should rate-limit viewCount on findOne', async () => {
    mockPrisma.insuranceOffer.findUnique.mockResolvedValue(mockItem);
    mockRedis.get.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    await service.findOne('ins-1', '1.2.3.4');
    expect(mockPrisma.insuranceOffer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
    );
  });

  it('should enforce owner check on remove', async () => {
    mockPrisma.insuranceOffer.findUnique.mockResolvedValue(mockItem);
    await expect(service.remove('ins-1', 'other-user')).rejects.toThrow(ForbiddenException);
  });
});

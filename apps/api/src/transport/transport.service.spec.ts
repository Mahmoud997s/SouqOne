import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TransportService } from './transport.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService } from '../search/search.service';

const mockPrisma = {
  transportService: {
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
  id: 'tr-1', title: 'نقل أثاث', slug: 'test-slug', description: 'وصف',
  transportType: 'MOVING', providerType: 'COMPANY', providerName: 'شركة النقل',
  basePrice: { toNumber: () => 50 }, currency: 'OMR', governorate: 'مسقط',
  status: 'ACTIVE', userId: 'user-1', viewCount: 0, createdAt: new Date(),
  images: [{ url: 'https://img.test/1.jpg' }],
  user: { id: 'user-1', username: 'test', displayName: 'Test', avatarUrl: null },
};

describe('TransportService', () => {
  let service: TransportService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: SearchService, useValue: mockSearch },
      ],
    }).compile();
    service = module.get<TransportService>(TransportService);
  });

  it('should create a transport listing', async () => {
    mockPrisma.transportService.create.mockResolvedValue(mockItem);
    const result = await service.create({
      title: 'نقل أثاث', description: 'وصف الخدمة بالتفصيل',
      transportType: 'MOVING' as any, providerName: 'شركة النقل',
      providerType: 'COMPANY' as any, governorate: 'مسقط',
    } as any, 'user-1');
    expect(result.id).toBe('tr-1');
    expect(mockSearch.indexDocument).toHaveBeenCalled();
  });

  it('should rate-limit viewCount on findOne', async () => {
    mockPrisma.transportService.findUnique.mockResolvedValue(mockItem);
    mockRedis.get.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // detail cache + view key
    await service.findOne('tr-1', '1.2.3.4');
    expect(mockPrisma.transportService.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
    );
  });

  it('should enforce owner check on remove', async () => {
    mockPrisma.transportService.findUnique.mockResolvedValue(mockItem);
    await expect(service.remove('tr-1', 'other-user')).rejects.toThrow(ForbiddenException);
  });

  it('should return paginated myListings', async () => {
    mockPrisma.transportService.findMany.mockResolvedValue([mockItem]);
    mockPrisma.transportService.count.mockResolvedValue(1);
    const result = await service.myListings('user-1');
    expect(result.meta.total).toBe(1);
  });
});

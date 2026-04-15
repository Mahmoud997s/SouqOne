import { Test, TestingModule } from '@nestjs/testing';
import { JobRecommendationService } from '../job-recommendation.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  driverProfile: { findUnique: jest.fn() },
  driverJob: { findMany: jest.fn() },
};

describe('JobRecommendationService', () => {
  let service: JobRecommendationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobRecommendationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<JobRecommendationService>(JobRecommendationService);
  });

  it('should return empty array if no driver profile', async () => {
    mockPrisma.driverProfile.findUnique.mockResolvedValue(null);
    const result = await service.getRecommended('user1');
    expect(result).toEqual([]);
  });

  it('should return empty array if no license types', async () => {
    mockPrisma.driverProfile.findUnique.mockResolvedValue({
      licenseTypes: [], governorate: 'Muscat', vehicleTypes: [],
    });
    const result = await service.getRecommended('user1');
    expect(result).toEqual([]);
  });

  it('should return matching jobs', async () => {
    mockPrisma.driverProfile.findUnique.mockResolvedValue({
      licenseTypes: ['HEAVY'], governorate: 'Muscat', vehicleTypes: [],
    });
    const mockJobs = [
      { id: 'j1', title: 'Driver needed', governorate: 'Muscat', licenseTypes: ['HEAVY'] },
      { id: 'j2', title: 'Transport driver', governorate: 'Muscat', licenseTypes: ['HEAVY', 'TRANSPORT'] },
    ];
    // First call: exact match. Second call: fill with gov jobs (empty)
    mockPrisma.driverJob.findMany.mockResolvedValueOnce(mockJobs);
    mockPrisma.driverJob.findMany.mockResolvedValueOnce([]);

    const result = await service.getRecommended('user1');
    expect(result).toEqual(mockJobs);
    expect(mockPrisma.driverJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          governorate: 'Muscat',
          licenseTypes: { hasSome: ['HEAVY'] },
        }),
      }),
    );
  });

  it('should fill with same-governorate jobs if not enough exact matches', async () => {
    mockPrisma.driverProfile.findUnique.mockResolvedValue({
      licenseTypes: ['BUS'], governorate: 'Dhofar', vehicleTypes: [],
    });
    // First call: exact match returns 2
    mockPrisma.driverJob.findMany.mockResolvedValueOnce([
      { id: 'j1', title: 'Bus Driver' },
    ]);
    // Second call: fill with governorate jobs
    mockPrisma.driverJob.findMany.mockResolvedValueOnce([
      { id: 'j2', title: 'Any driver' },
    ]);

    const result = await service.getRecommended('user1', 10);
    expect(result).toHaveLength(2);
  });

  it('should exclude own jobs', async () => {
    mockPrisma.driverProfile.findUnique.mockResolvedValue({
      licenseTypes: ['LIGHT'], governorate: 'Muscat', vehicleTypes: [],
    });
    mockPrisma.driverJob.findMany.mockResolvedValueOnce([]);
    mockPrisma.driverJob.findMany.mockResolvedValueOnce([]);

    await service.getRecommended('user1');
    expect(mockPrisma.driverJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: { not: 'user1' },
        }),
      }),
    );
  });
});

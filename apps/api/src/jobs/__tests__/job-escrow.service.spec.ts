import { Test, TestingModule } from '@nestjs/testing';
import { JobEscrowService } from '../job-escrow.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

const mockPrisma = {
  jobApplication: { findUnique: jest.fn() },
  jobEscrow: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockNotifications = { create: jest.fn().mockResolvedValue({}) };

describe('JobEscrowService', () => {
  let service: JobEscrowService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobEscrowService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get<JobEscrowService>(JobEscrowService);
  });

  describe('pay', () => {
    it('should create escrow for ACCEPTED application', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue({
        id: 'app1', status: 'ACCEPTED', applicantId: 'driver1',
        job: { userId: 'employer1' }, escrow: null,
      });
      mockPrisma.jobEscrow.create.mockResolvedValue({
        id: 'esc1', applicationId: 'app1', amount: 5000, status: 'HELD',
      });

      const result = await service.pay('app1', 'employer1', 5000);
      expect(result.status).toBe('HELD');
      expect(result.amount).toBe(5000);
    });

    it('should throw NotFoundException for missing application', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue(null);
      await expect(service.pay('bad', 'u1', 5000)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue({
        id: 'app1', status: 'ACCEPTED', job: { userId: 'owner' }, escrow: null,
      });
      await expect(service.pay('app1', 'other', 5000)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-ACCEPTED', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue({
        id: 'app1', status: 'PENDING', job: { userId: 'u1' }, escrow: null,
      });
      await expect(service.pay('app1', 'u1', 5000)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if already paid', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue({
        id: 'app1', status: 'ACCEPTED', job: { userId: 'u1' }, escrow: { id: 'esc1' },
      });
      await expect(service.pay('app1', 'u1', 5000)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for zero amount', async () => {
      mockPrisma.jobApplication.findUnique.mockResolvedValue({
        id: 'app1', status: 'ACCEPTED', job: { userId: 'u1' }, escrow: null,
      });
      await expect(service.pay('app1', 'u1', 0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('release', () => {
    it('should release HELD escrow', async () => {
      mockPrisma.jobEscrow.findUnique.mockResolvedValue({
        id: 'esc1', status: 'HELD', amount: 5000,
        application: { applicantId: 'driver1', job: { userId: 'employer1' } },
      });
      mockPrisma.jobEscrow.update.mockResolvedValue({ id: 'esc1', status: 'RELEASED' });

      const result = await service.release('esc1', 'employer1');
      expect(result.status).toBe('RELEASED');
    });

    it('should throw ForbiddenException for non-owner release', async () => {
      mockPrisma.jobEscrow.findUnique.mockResolvedValue({
        id: 'esc1', status: 'HELD',
        application: { applicantId: 'driver1', job: { userId: 'employer1' } },
      });
      await expect(service.release('esc1', 'driver1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-HELD release', async () => {
      mockPrisma.jobEscrow.findUnique.mockResolvedValue({
        id: 'esc1', status: 'RELEASED',
        application: { applicantId: 'driver1', job: { userId: 'employer1' } },
      });
      await expect(service.release('esc1', 'employer1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('dispute', () => {
    it('should open dispute on HELD escrow', async () => {
      mockPrisma.jobEscrow.findUnique.mockResolvedValue({
        id: 'esc1', status: 'HELD',
        application: { applicantId: 'driver1', job: { userId: 'employer1' } },
      });
      mockPrisma.jobEscrow.update.mockResolvedValue({ id: 'esc1', status: 'DISPUTED' });

      const result = await service.dispute('esc1', 'driver1', 'لم يتم تنفيذ العمل');
      expect(result.status).toBe('DISPUTED');
    });

    it('should throw ForbiddenException for unauthorized dispute', async () => {
      mockPrisma.jobEscrow.findUnique.mockResolvedValue({
        id: 'esc1', status: 'HELD',
        application: { applicantId: 'driver1', job: { userId: 'employer1' } },
      });
      await expect(service.dispute('esc1', 'random', 'test')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for non-HELD dispute', async () => {
      mockPrisma.jobEscrow.findUnique.mockResolvedValue({
        id: 'esc1', status: 'RELEASED',
        application: { applicantId: 'driver1', job: { userId: 'employer1' } },
      });
      await expect(service.dispute('esc1', 'employer1')).rejects.toThrow(BadRequestException);
    });
  });
});

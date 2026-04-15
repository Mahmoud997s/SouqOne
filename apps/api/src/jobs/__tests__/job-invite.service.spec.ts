import { Test, TestingModule } from '@nestjs/testing';
import { JobInviteService } from '../job-invite.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  driverJob: { findUnique: jest.fn() },
  driverProfile: { findUnique: jest.fn() },
  jobInvite: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockNotifications = { create: jest.fn().mockResolvedValue({}) };

describe('JobInviteService', () => {
  let service: JobInviteService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobInviteService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get<JobInviteService>(JobInviteService);
  });

  describe('invite', () => {
    const setup = () => {
      mockPrisma.driverJob.findUnique.mockResolvedValue({ id: 'job1', userId: 'employer1', status: 'ACTIVE' });
      mockPrisma.driverProfile.findUnique.mockResolvedValue({ id: 'dp1', userId: 'driver1' });
      mockPrisma.jobInvite.findUnique.mockResolvedValue(null);
      mockPrisma.jobInvite.create.mockResolvedValue({
        id: 'inv1', jobId: 'job1', inviterId: 'employer1', inviteeId: 'driver1', status: 'PENDING',
        job: { title: 'Test Job' },
      });
    };

    it('should create an invite', async () => {
      setup();
      const result = await service.invite('job1', 'employer1', 'driver1', 'Join us!');
      expect(result.id).toBe('inv1');
      expect(mockNotifications.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrisma.driverJob.findUnique.mockResolvedValue(null);
      await expect(service.invite('bad', 'employer1', 'driver1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not job owner', async () => {
      mockPrisma.driverJob.findUnique.mockResolvedValue({ id: 'job1', userId: 'other', status: 'ACTIVE' });
      await expect(service.invite('job1', 'employer1', 'driver1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for inactive job', async () => {
      mockPrisma.driverJob.findUnique.mockResolvedValue({ id: 'job1', userId: 'employer1', status: 'CLOSED' });
      await expect(service.invite('job1', 'employer1', 'driver1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for self-invite', async () => {
      mockPrisma.driverJob.findUnique.mockResolvedValue({ id: 'job1', userId: 'user1', status: 'ACTIVE' });
      await expect(service.invite('job1', 'user1', 'user1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if driver has no profile', async () => {
      mockPrisma.driverJob.findUnique.mockResolvedValue({ id: 'job1', userId: 'employer1', status: 'ACTIVE' });
      mockPrisma.driverProfile.findUnique.mockResolvedValue(null);
      await expect(service.invite('job1', 'employer1', 'driver1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate invite', async () => {
      setup();
      mockPrisma.jobInvite.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.invite('job1', 'employer1', 'driver1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getMyInvites', () => {
    it('should return invites for driver', async () => {
      mockPrisma.jobInvite.findMany.mockResolvedValue([{ id: 'inv1' }]);
      const result = await service.getMyInvites('driver1');
      expect(result).toHaveLength(1);
    });
  });

  describe('respond', () => {
    it('should accept an invite', async () => {
      mockPrisma.jobInvite.findUnique.mockResolvedValue({
        id: 'inv1', inviteeId: 'driver1', status: 'PENDING',
        job: { title: 'Test', userId: 'employer1' },
      });
      mockPrisma.jobInvite.update.mockResolvedValue({ id: 'inv1', status: 'ACCEPTED' });

      const result = await service.respond('inv1', 'driver1', 'ACCEPTED');
      expect(result.status).toBe('ACCEPTED');
    });

    it('should decline an invite', async () => {
      mockPrisma.jobInvite.findUnique.mockResolvedValue({
        id: 'inv1', inviteeId: 'driver1', status: 'PENDING',
        job: { title: 'Test', userId: 'employer1' },
      });
      mockPrisma.jobInvite.update.mockResolvedValue({ id: 'inv1', status: 'DECLINED' });

      const result = await service.respond('inv1', 'driver1', 'DECLINED');
      expect(result.status).toBe('DECLINED');
    });

    it('should throw NotFoundException for non-existent invite', async () => {
      mockPrisma.jobInvite.findUnique.mockResolvedValue(null);
      await expect(service.respond('bad', 'driver1', 'ACCEPTED')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the invitee', async () => {
      mockPrisma.jobInvite.findUnique.mockResolvedValue({
        id: 'inv1', inviteeId: 'other', status: 'PENDING',
        job: { title: 'Test', userId: 'employer1' },
      });
      await expect(service.respond('inv1', 'driver1', 'ACCEPTED')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if not PENDING', async () => {
      mockPrisma.jobInvite.findUnique.mockResolvedValue({
        id: 'inv1', inviteeId: 'driver1', status: 'ACCEPTED',
        job: { title: 'Test', userId: 'employer1' },
      });
      await expect(service.respond('inv1', 'driver1', 'DECLINED')).rejects.toThrow(BadRequestException);
    });
  });
});

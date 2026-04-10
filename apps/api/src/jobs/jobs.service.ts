import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { Prisma, ApplicationStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /* ───── helpers ───── */
  private slugify(text: string): string {
    return (
      text
        .replace(/[^\u0621-\u064Aa-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 80) +
      '-' +
      Date.now().toString(36)
    );
  }

  /* ───── CREATE ───── */
  async create(userId: string, dto: CreateJobDto) {
    const slug = this.slugify(dto.title);

    return this.prisma.driverJob.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        jobType: dto.jobType,
        employmentType: dto.employmentType,
        salary: dto.salary,
        salaryPeriod: dto.salaryPeriod,
        licenseTypes: dto.licenseTypes ?? [],
        experienceYears: dto.experienceYears,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        languages: dto.languages ?? [],
        nationality: dto.nationality,
        vehicleTypes: dto.vehicleTypes ?? [],
        hasOwnVehicle: dto.hasOwnVehicle ?? false,
        governorate: dto.governorate,
        city: dto.city,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        whatsapp: dto.whatsapp,
        userId,
      },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true } } },
    });
  }

  /* ───── FIND ALL ───── */
  async findAll(query: QueryJobsDto) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.DriverJobWhereInput = {};

    // default: only active
    where.status = (query.status as any) || 'ACTIVE';

    if (query.jobType) where.jobType = query.jobType;
    if (query.employmentType) where.employmentType = query.employmentType;
    if (query.governorate) where.governorate = query.governorate;

    if (query.licenseType) {
      where.licenseTypes = { has: query.licenseType as any };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const allowedSort = ['createdAt', 'salary', 'experienceYears', 'viewCount'];
    const orderBy: any = allowedSort.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.driverJob.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          _count: { select: { applications: true } },
        },
      }),
      this.prisma.driverJob.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ───── FIND ONE ───── */
  async findOne(id: string) {
    const job = await this.prisma.driverJob.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true, createdAt: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) throw new NotFoundException('الوظيفة غير موجودة');

    // increment view count
    await this.prisma.driverJob.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return job;
  }

  /* ───── UPDATE ───── */
  async update(id: string, userId: string, dto: UpdateJobDto) {
    const job = await this.prisma.driverJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('الوظيفة غير موجودة');
    if (job.userId !== userId) throw new ForbiddenException('غير مصرح لك بتعديل هذه الوظيفة');

    return this.prisma.driverJob.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.jobType && { jobType: dto.jobType }),
        ...(dto.employmentType && { employmentType: dto.employmentType }),
        ...(dto.salary !== undefined && { salary: dto.salary }),
        ...(dto.salaryPeriod && { salaryPeriod: dto.salaryPeriod }),
        ...(dto.licenseTypes && { licenseTypes: dto.licenseTypes }),
        ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        ...(dto.minAge !== undefined && { minAge: dto.minAge }),
        ...(dto.maxAge !== undefined && { maxAge: dto.maxAge }),
        ...(dto.languages && { languages: dto.languages }),
        ...(dto.nationality !== undefined && { nationality: dto.nationality }),
        ...(dto.vehicleTypes && { vehicleTypes: dto.vehicleTypes }),
        ...(dto.hasOwnVehicle !== undefined && { hasOwnVehicle: dto.hasOwnVehicle }),
        ...(dto.governorate && { governorate: dto.governorate }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.status && { status: dto.status }),
      },
      include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
  }

  /* ───── DELETE ───── */
  async remove(id: string, userId: string) {
    const job = await this.prisma.driverJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('الوظيفة غير موجودة');
    if (job.userId !== userId) throw new ForbiddenException('غير مصرح لك بحذف هذه الوظيفة');

    await this.prisma.driverJob.delete({ where: { id } });
    return { message: 'تم حذف الوظيفة بنجاح' };
  }

  /* ───── MY JOBS ───── */
  async myJobs(userId: string) {
    return this.prisma.driverJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    });
  }

  /* ───── APPLY TO JOB ───── */
  async apply(jobId: string, applicantId: string, dto: ApplyJobDto) {
    const job = await this.prisma.driverJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('الوظيفة غير موجودة');
    if (job.status !== 'ACTIVE') throw new ForbiddenException('هذه الوظيفة مغلقة');
    if (job.userId === applicantId) throw new ForbiddenException('لا يمكنك التقديم على وظيفتك الخاصة');

    // check duplicate
    const existing = await this.prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId, applicantId } },
    });
    if (existing) throw new ConflictException('لقد قدمت على هذه الوظيفة مسبقاً');

    const application = await this.prisma.jobApplication.create({
      data: {
        jobId,
        applicantId,
        message: dto.message,
        resumeUrl: dto.resumeUrl,
      },
      include: {
        applicant: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    // notify job owner
    await this.notifications.create({
      userId: job.userId,
      type: 'JOB_APPLICATION',
      title: 'طلب توظيف جديد',
      body: `قام ${application.applicant.displayName || application.applicant.username} بالتقديم على "${job.title}"`,
      data: { jobId, applicationId: application.id },
    });

    return application;
  }

  /* ───── GET APPLICATIONS FOR MY JOB ───── */
  async getApplications(jobId: string, userId: string) {
    const job = await this.prisma.driverJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('الوظيفة غير موجودة');
    if (job.userId !== userId) throw new ForbiddenException('غير مصرح لك بعرض الطلبات');

    return this.prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, phone: true, governorate: true },
        },
      },
    });
  }

  /* ───── UPDATE APPLICATION STATUS ───── */
  async updateApplicationStatus(applicationId: string, userId: string, status: ApplicationStatus) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: { select: { userId: true, title: true } },
        applicant: { select: { id: true } },
      },
    });

    if (!application) throw new NotFoundException('الطلب غير موجود');
    if (application.job.userId !== userId) throw new ForbiddenException('غير مصرح لك');

    const updated = await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        applicant: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    });

    // notify applicant
    const notifType = status === 'ACCEPTED' ? 'JOB_APPLICATION_ACCEPTED' : 'JOB_APPLICATION_REJECTED';
    const notifTitle = status === 'ACCEPTED' ? 'تم قبول طلبك' : 'تم رفض طلبك';
    const notifBody = status === 'ACCEPTED'
      ? `تم قبول طلبك على "${application.job.title}"`
      : `للأسف تم رفض طلبك على "${application.job.title}"`;

    await this.notifications.create({
      userId: application.applicant.id,
      type: notifType as any,
      title: notifTitle,
      body: notifBody,
      data: { jobId: application.jobId, applicationId },
    });

    return updated;
  }
}

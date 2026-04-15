import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const JOB_EXPIRY_DAYS = 30;

@Injectable()
export class JobExpiryService {
  private readonly logger = new Logger(JobExpiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async expireOldJobs() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - JOB_EXPIRY_DAYS);

    const { count } = await this.prisma.driverJob.updateMany({
      where: {
        status: 'ACTIVE',
        createdAt: { lt: cutoff },
      },
      data: { status: 'EXPIRED' },
    });

    if (count > 0) {
      this.logger.log(`Expired ${count} jobs older than ${JOB_EXPIRY_DAYS} days`);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendWeeklyJobRecommendations() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get active drivers
    const drivers = await this.prisma.driverProfile.findMany({
      where: { isAvailable: true },
      select: { userId: true, governorate: true, licenseTypes: true },
      take: 200,
    });

    if (drivers.length === 0) return;

    let sentCount = 0;

    for (const driver of drivers) {
      // Find new jobs matching this driver
      const matchingJobs = await this.prisma.driverJob.findMany({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: oneWeekAgo },
          governorate: driver.governorate,
          licenseTypes: { hasSome: driver.licenseTypes },
          userId: { not: driver.userId },
        },
        select: { id: true, title: true },
        take: 3,
      });

      if (matchingJobs.length === 0) continue;

      const jobTitles = matchingJobs.map((j) => j.title).join('، ');
      await this.notifications.create({
        userId: driver.userId,
        type: 'JOB_RECOMMENDATION' as any,
        title: 'وظائف جديدة قد تناسبك',
        body: `${matchingJobs.length} وظائف جديدة: ${jobTitles}`,
        data: { jobIds: matchingJobs.map((j) => j.id) },
      }).catch(() => {});

      sentCount++;
    }

    if (sentCount > 0) {
      this.logger.log(`Sent weekly recommendations to ${sentCount} drivers`);
    }
  }
}

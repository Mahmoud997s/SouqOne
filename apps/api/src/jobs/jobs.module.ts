import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobExpiryService } from './job-expiry.service';
import { DriverProfileService } from './driver-profile.service';
import { EmployerProfileService } from './employer-profile.service';
import { JobInviteService } from './job-invite.service';
import { DriverVerificationService } from './driver-verification.service';
import { JobEscrowService } from './job-escrow.service';
import { AdminJobsService } from './admin-jobs.service';
import { AdminJobsController } from './admin-jobs.controller';
import { JobRecommendationService } from './job-recommendation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [PrismaModule, RedisModule, NotificationsModule, SearchModule],
  controllers: [JobsController, AdminJobsController],
  providers: [JobsService, JobExpiryService, DriverProfileService, EmployerProfileService, JobInviteService, DriverVerificationService, JobEscrowService, AdminJobsService, JobRecommendationService],
})
export class JobsModule {}

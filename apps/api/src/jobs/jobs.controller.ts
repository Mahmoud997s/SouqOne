import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { ApplyJobDto } from './dto/apply-job.dto';
import { ApplicationStatus } from '@prisma/client';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateJobDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.jobsService.create(user.sub, dto);
  }

  @Get()
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myJobs(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.jobsService.myJobs(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.jobsService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.jobsService.remove(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  apply(@Param('id') jobId: string, @Body() dto: ApplyJobDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.jobsService.apply(jobId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applications')
  getApplications(@Param('id') jobId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.jobsService.getApplications(jobId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:id')
  updateApplicationStatus(
    @Param('id') applicationId: string,
    @Body('status') status: ApplicationStatus,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.jobsService.updateApplicationStatus(applicationId, user.sub, status);
  }
}

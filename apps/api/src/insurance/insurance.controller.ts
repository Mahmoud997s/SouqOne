import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { InsuranceService } from './insurance.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { QueryInsuranceDto } from './dto/query-insurance.dto';

@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateInsuranceDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.insuranceService.create(dto, user.sub);
  }

  @Get()
  findAll(@Query() query: QueryInsuranceDto) {
    return this.insuranceService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myOffers(@Req() req: Request, @Query('page') page?: string, @Query('limit') limit?: string) {
    const user = req.user as JwtPayload;
    return this.insuranceService.myListings(user.sub, parseInt(page ?? '1'), parseInt(limit ?? '20'));
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    return this.insuranceService.findBySlug(slug, req.ip);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.insuranceService.findOne(id, req.ip);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  toggleStatus(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.insuranceService.toggleStatus(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateInsuranceDto>, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.insuranceService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.insuranceService.remove(id, user.sub);
  }
}

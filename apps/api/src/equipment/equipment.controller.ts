import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { EquipmentListingsService } from './equipment-listings.service';
import { CreateEquipmentListingDto } from './dto/create-equipment-listing.dto';
import { UpdateEquipmentListingDto } from './dto/update-equipment-listing.dto';
import { QueryEquipmentListingsDto } from './dto/query-equipment-listings.dto';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly svc: EquipmentListingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEquipmentListingDto, @Req() req: Request) {
    return this.svc.create(dto, (req.user as JwtPayload).sub);
  }

  @Get()
  findAll(@Query() query: QueryEquipmentListingsDto) {
    return this.svc.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: Request) {
    return this.svc.my((req.user as JwtPayload).sub);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentListingDto, @Req() req: Request) {
    return this.svc.update(id, (req.user as JwtPayload).sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.svc.remove(id, (req.user as JwtPayload).sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  addImages(@Param('id') id: string, @Body() body: { urls: string[] }, @Req() req: Request) {
    return this.svc.addImages(id, (req.user as JwtPayload).sub, body.urls);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:imageId')
  removeImage(@Param('imageId') imageId: string, @Req() req: Request) {
    return this.svc.removeImage(imageId, (req.user as JwtPayload).sub);
  }
}

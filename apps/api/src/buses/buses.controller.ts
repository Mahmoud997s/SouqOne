import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { BusesService } from './buses.service';
import { CreateBusListingDto } from './dto/create-bus-listing.dto';
import { QueryBusListingsDto } from './dto/query-bus-listings.dto';

@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBusListingDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.busesService.create(dto, user.sub);
  }

  @Get()
  findAll(@Query() query: QueryBusListingsDto) {
    return this.busesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myListings(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.busesService.myListings(user.sub);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.busesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateBusListingDto>, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.busesService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.busesService.remove(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  addImages(@Param('id') id: string, @Body() body: { urls: string[] }, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.busesService.addImages(id, user.sub, body.urls);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:imageId')
  removeImage(@Param('imageId') imageId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.busesService.removeImage(imageId, user.sub);
  }
}

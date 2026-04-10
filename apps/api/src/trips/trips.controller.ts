import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { QueryTripsDto } from './dto/query-trips.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTripDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.tripsService.create(dto, user.sub);
  }

  @Get()
  findAll(@Query() query: QueryTripsDto) {
    return this.tripsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myTrips(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.tripsService.myTrips(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTripDto>, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.tripsService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.tripsService.remove(id, user.sub);
  }
}

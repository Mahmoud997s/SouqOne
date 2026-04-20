import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.bookingsService.create(dto, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyBookings(@Query() query: QueryBookingsDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.bookingsService.findMyBookings(user.sub, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  findReceivedBookings(@Query() query: QueryBookingsDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.bookingsService.findReceivedBookings(user.sub, query);
  }

  @Get('availability/:entityType/:entityId')
  getAvailability(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.bookingsService.getAvailability(entityType, entityId);
  }

  @Get('calculate-price')
  calculatePrice(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingsService.calculatePriceForEntity(entityType, entityId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.bookingsService.findOne(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    return this.bookingsService.updateStatus(id, dto, user.sub);
  }
}

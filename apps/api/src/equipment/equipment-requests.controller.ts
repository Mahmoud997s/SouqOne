import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentRequestDto } from './dto/create-equipment-request.dto';
import { QueryEquipmentRequestsDto } from './dto/query-equipment-requests.dto';
import { CreateEquipmentBidDto } from './dto/create-equipment-bid.dto';

@Controller('equipment-requests')
export class EquipmentRequestsController {
  constructor(private readonly svc: EquipmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEquipmentRequestDto, @Req() req: Request) {
    return this.svc.createRequest(dto, (req.user as JwtPayload).sub);
  }

  @Get()
  findAll(@Query() query: QueryEquipmentRequestsDto) {
    return this.svc.findAllRequests(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: Request) {
    return this.svc.myRequests((req.user as JwtPayload).sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOneRequest(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateEquipmentRequestDto> & { requestStatus?: string }, @Req() req: Request) {
    return this.svc.updateRequest(id, (req.user as JwtPayload).sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.svc.removeRequest(id, (req.user as JwtPayload).sub);
  }

  // ─── Bids ───

  @UseGuards(JwtAuthGuard)
  @Post(':id/bids')
  createBid(@Param('id') id: string, @Body() dto: CreateEquipmentBidDto, @Req() req: Request) {
    return this.svc.createBid(id, dto, (req.user as JwtPayload).sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/bids/:bidId/accept')
  acceptBid(@Param('id') id: string, @Param('bidId') bidId: string, @Req() req: Request) {
    return this.svc.acceptBid(id, bidId, (req.user as JwtPayload).sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/bids/:bidId/reject')
  rejectBid(@Param('id') id: string, @Param('bidId') bidId: string, @Req() req: Request) {
    return this.svc.rejectBid(id, bidId, (req.user as JwtPayload).sub);
  }
}

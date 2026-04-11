import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { EquipmentRequestsService } from './equipment-requests.service';
import { EquipmentBidsService } from './equipment-bids.service';
import { CreateEquipmentRequestDto } from './dto/create-equipment-request.dto';
import { UpdateEquipmentRequestDto } from './dto/update-equipment-request.dto';
import { QueryEquipmentRequestsDto } from './dto/query-equipment-requests.dto';
import { CreateEquipmentBidDto } from './dto/create-equipment-bid.dto';

@Controller('equipment-requests')
export class EquipmentRequestsController {
  constructor(
    private readonly reqSvc: EquipmentRequestsService,
    private readonly bidSvc: EquipmentBidsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEquipmentRequestDto, @Req() req: Request) {
    return this.reqSvc.create(dto, (req.user as JwtPayload).sub);
  }

  @Get()
  findAll(@Query() query: QueryEquipmentRequestsDto) {
    return this.reqSvc.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: Request) {
    return this.reqSvc.my((req.user as JwtPayload).sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reqSvc.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentRequestDto, @Req() req: Request) {
    return this.reqSvc.update(id, (req.user as JwtPayload).sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() body: { requestStatus: string }, @Req() req: Request) {
    return this.reqSvc.changeStatus(id, (req.user as JwtPayload).sub, body.requestStatus);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.reqSvc.remove(id, (req.user as JwtPayload).sub);
  }

  // ─── Bids ───

  @UseGuards(JwtAuthGuard)
  @Post(':id/bids')
  createBid(@Param('id') id: string, @Body() dto: CreateEquipmentBidDto, @Req() req: Request) {
    return this.bidSvc.create(id, dto, (req.user as JwtPayload).sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/bids/:bidId/accept')
  acceptBid(@Param('id') id: string, @Param('bidId') bidId: string, @Req() req: Request) {
    return this.bidSvc.accept(id, bidId, (req.user as JwtPayload).sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/bids/:bidId/reject')
  rejectBid(@Param('id') id: string, @Param('bidId') bidId: string, @Req() req: Request) {
    return this.bidSvc.reject(id, bidId, (req.user as JwtPayload).sub);
  }
}

import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { EquipmentService } from './equipment.service';
import { CreateOperatorListingDto } from './dto/create-operator-listing.dto';
import { QueryOperatorListingsDto } from './dto/query-operator-listings.dto';

@Controller('operators')
export class OperatorsController {
  constructor(private readonly svc: EquipmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOperatorListingDto, @Req() req: Request) {
    return this.svc.createOperator(dto, (req.user as JwtPayload).sub);
  }

  @Get()
  findAll(@Query() query: QueryOperatorListingsDto) {
    return this.svc.findAllOperators(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: Request) {
    return this.svc.myOperators((req.user as JwtPayload).sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOneOperator(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateOperatorListingDto>, @Req() req: Request) {
    return this.svc.updateOperator(id, (req.user as JwtPayload).sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.svc.removeOperator(id, (req.user as JwtPayload).sub);
  }
}

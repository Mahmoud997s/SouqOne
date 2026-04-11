import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { OperatorsService } from './operators.service';
import { CreateOperatorListingDto } from './dto/create-operator-listing.dto';
import { UpdateOperatorListingDto } from './dto/update-operator-listing.dto';
import { QueryOperatorListingsDto } from './dto/query-operator-listings.dto';

@Controller('operators')
export class OperatorsController {
  constructor(private readonly svc: OperatorsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOperatorListingDto, @Req() req: Request) {
    return this.svc.create(dto, (req.user as JwtPayload).sub);
  }

  @Get()
  findAll(@Query() query: QueryOperatorListingsDto) {
    return this.svc.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  my(@Req() req: Request) {
    return this.svc.my((req.user as JwtPayload).sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOperatorListingDto, @Req() req: Request) {
    return this.svc.update(id, (req.user as JwtPayload).sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.svc.remove(id, (req.user as JwtPayload).sub);
  }
}

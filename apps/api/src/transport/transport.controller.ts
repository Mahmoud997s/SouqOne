import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { TransportService } from './transport.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { QueryTransportDto } from './dto/query-transport.dto';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTransportDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.transportService.create(dto, user.sub);
  }

  @Get()
  findAll(@Query() query: QueryTransportDto) {
    return this.transportService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myTransport(@Req() req: Request, @Query('page') page?: string, @Query('limit') limit?: string) {
    const user = req.user as JwtPayload;
    return this.transportService.myListings(user.sub, parseInt(page ?? '1'), parseInt(limit ?? '20'));
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    return this.transportService.findBySlug(slug, req.ip);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.transportService.findOne(id, req.ip);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  toggleStatus(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.transportService.toggleStatus(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTransportDto>, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.transportService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.transportService.remove(id, user.sub);
  }
}

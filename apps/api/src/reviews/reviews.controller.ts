import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

interface JwtPayload { sub: string; username: string }

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateReviewDto, @Req() req: Request) {
    return this.reviewsService.create(dto, (req.user as JwtPayload).sub);
  }

  @Get()
  findAll(@Query() query: QueryReviewsDto) {
    return this.reviewsService.findAll(query);
  }

  @Get('summary/:userId')
  getSummary(@Param('userId') userId: string) {
    return this.reviewsService.getSummary(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @Body() dto: ReplyReviewDto,
    @Req() req: Request,
  ) {
    return this.reviewsService.reply(id, dto, (req.user as JwtPayload).sub);
  }
}

import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { PartCategory, PartCondition } from '@prisma/client';

export class QueryPartsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PartCategory)
  partCategory?: PartCategory;

  @IsOptional()
  @IsEnum(PartCondition)
  condition?: PartCondition;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

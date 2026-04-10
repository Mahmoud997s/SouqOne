import {
  IsString, IsEnum, IsOptional, IsNumber, IsArray,
  Min, MaxLength, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InsuranceType } from '@prisma/client';

export class CreateInsuranceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(InsuranceType)
  offerType!: InsuranceType;

  @IsString()
  providerName!: string;

  @IsOptional()
  @IsString()
  providerLogo?: string;

  @IsOptional()
  @IsString()
  coverageType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  priceFrom?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsString()
  termsUrl?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

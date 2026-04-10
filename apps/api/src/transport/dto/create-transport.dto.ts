import {
  IsString, IsEnum, IsOptional, IsNumber, IsArray,
  IsBoolean, Min, MaxLength, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportType, PricingType, ProviderType } from '@prisma/client';

export class CreateTransportDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(TransportType)
  transportType!: TransportType;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  vehicleCapacity?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverageAreas?: string[];

  @IsOptional()
  @IsEnum(PricingType)
  pricingType?: PricingType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  pricePerKm?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  hasInsurance?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTracking?: boolean;

  @IsString()
  providerName!: string;

  @IsEnum(ProviderType)
  providerType!: ProviderType;

  @IsString()
  governorate!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;
}

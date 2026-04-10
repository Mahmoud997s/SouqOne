import {
  IsString, IsEnum, IsOptional, IsNumber, IsArray, IsInt,
  Min, MaxLength, MinLength, IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TripType, ScheduleType } from '@prisma/client';

export class CreateTripDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(TripType)
  tripType!: TripType;

  @IsString()
  routeFrom!: string;

  @IsString()
  routeTo!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  routeStops?: string[];

  @IsEnum(ScheduleType)
  scheduleType!: ScheduleType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  departureTimes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  operatingDays?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  pricePerTrip?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  priceMonthly?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  availableSeats?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsString()
  providerName!: string;

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

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

import {
  IsString, IsEnum, IsOptional, IsNumber, IsArray,
  IsBoolean, Min, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LicenseType } from '@prisma/client';

export class CreateDriverProfileDto {
  @IsArray()
  @IsEnum(LicenseType, { each: true })
  licenseTypes!: LicenseType[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleTypes?: string[];

  @IsOptional()
  @IsBoolean()
  hasOwnVehicle?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(10)
  bio?: string;

  @IsString()
  governorate!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;
}

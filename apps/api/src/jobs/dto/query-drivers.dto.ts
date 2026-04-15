import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { LicenseType } from '@prisma/client';

export class QueryDriversDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

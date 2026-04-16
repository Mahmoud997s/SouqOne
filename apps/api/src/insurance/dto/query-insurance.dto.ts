import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { InsuranceType } from '@prisma/client';

export class QueryInsuranceDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(InsuranceType)
  offerType?: InsuranceType;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

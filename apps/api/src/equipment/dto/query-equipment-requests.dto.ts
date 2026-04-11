import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryEquipmentRequestsDto {
  @IsOptional() @IsString()
  equipmentType?: string;

  @IsOptional() @IsEnum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'])
  requestStatus?: string;

  @IsOptional() @IsString()
  governorate?: string;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsString()
  sortBy?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number;
}

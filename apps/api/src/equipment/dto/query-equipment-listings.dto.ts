import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryEquipmentListingsDto {
  @IsOptional() @IsString()
  equipmentType?: string;

  @IsOptional() @IsEnum(['EQUIPMENT_SALE', 'EQUIPMENT_RENT'])
  listingType?: string;

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

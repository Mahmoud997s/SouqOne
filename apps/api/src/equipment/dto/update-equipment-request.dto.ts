import {
  IsString, IsOptional, IsInt, IsBoolean,
  IsNumber, Min, MinLength, IsDateString,
} from 'class-validator';

/**
 * Whitelist of updatable fields — excludes userId, requestStatus, slug, viewCount, equipmentType.
 * requestStatus transitions are handled separately in the service.
 */
export class UpdateEquipmentRequestDto {
  @IsOptional() @IsString() @MinLength(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' })
  title?: string;

  @IsOptional() @IsString() @MinLength(10, { message: 'الوصف يجب أن يكون 10 أحرف على الأقل' })
  description?: string;

  @IsOptional() @IsInt() @Min(1)
  quantity?: number;

  @IsOptional() @IsNumber() @Min(0)
  budgetMin?: number;

  @IsOptional() @IsNumber() @Min(0)
  budgetMax?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsString()
  rentalDuration?: string;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsBoolean()
  withOperator?: boolean;

  @IsOptional() @IsString()
  governorate?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  siteDetails?: string;

  @IsOptional() @IsNumber()
  latitude?: number;

  @IsOptional() @IsNumber()
  longitude?: number;

  @IsOptional() @IsString()
  contactPhone?: string;

  @IsOptional() @IsString()
  whatsapp?: string;
}

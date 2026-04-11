import {
  IsString, IsOptional, IsEnum, IsInt, IsBoolean,
  IsNumber, IsArray, Min, Max, MinLength,
} from 'class-validator';

/**
 * Whitelist of updatable fields — excludes userId, status, slug, viewCount.
 */
export class UpdateEquipmentListingDto {
  @IsOptional() @IsString() @MinLength(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' })
  title?: string;

  @IsOptional() @IsString() @MinLength(10, { message: 'الوصف يجب أن يكون 10 أحرف على الأقل' })
  description?: string;

  @IsOptional() @IsEnum(
    ['EXCAVATOR','CRANE','LOADER','BULLDOZER','FORKLIFT','CONCRETE_MIXER','GENERATOR','COMPRESSOR','SCAFFOLDING','WELDING_MACHINE','TRUCK','DUMP_TRUCK','WATER_TANKER','LIGHT_EQUIPMENT','OTHER_EQUIPMENT'],
    { message: 'نوع المعدة غير صالح' },
  )
  equipmentType?: string;

  @IsOptional() @IsEnum(['EQUIPMENT_SALE', 'EQUIPMENT_RENT'], { message: 'نوع الإعلان غير صالح' })
  listingType?: string;

  @IsOptional() @IsString()
  make?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsInt() @Min(1950) @Max(2030)
  year?: number;

  @IsOptional() @IsEnum(['NEW','USED','LIKE_NEW','GOOD','FAIR','POOR'])
  condition?: string;

  @IsOptional() @IsString()
  capacity?: string;

  @IsOptional() @IsString()
  power?: string;

  @IsOptional() @IsString()
  weight?: string;

  @IsOptional() @IsInt() @Min(0)
  hoursUsed?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  features?: string[];

  @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @IsOptional() @IsNumber() @Min(0)
  dailyPrice?: number;

  @IsOptional() @IsNumber() @Min(0)
  weeklyPrice?: number;

  @IsOptional() @IsNumber() @Min(0)
  monthlyPrice?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsBoolean()
  isPriceNegotiable?: boolean;

  @IsOptional() @IsBoolean()
  withOperator?: boolean;

  @IsOptional() @IsBoolean()
  deliveryAvailable?: boolean;

  @IsOptional() @IsInt() @Min(1)
  minRentalDays?: number;

  @IsOptional() @IsString()
  governorate?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsNumber()
  latitude?: number;

  @IsOptional() @IsNumber()
  longitude?: number;

  @IsOptional() @IsString()
  contactPhone?: string;

  @IsOptional() @IsString()
  whatsapp?: string;
}

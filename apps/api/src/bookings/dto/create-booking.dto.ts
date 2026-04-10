import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  listingId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  driverRequested?: boolean;

  @IsOptional()
  @IsBoolean()
  insuranceSelected?: boolean;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

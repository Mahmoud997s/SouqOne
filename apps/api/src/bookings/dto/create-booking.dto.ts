import { IsString, IsDateString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateBookingDto {
  @IsIn(['CAR', 'BUS', 'EQUIPMENT', 'TRANSPORT', 'TRIP'])
  entityType!: string;

  @IsString()
  entityId!: string;

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

  @IsOptional()
  @IsString()
  quantity?: string;
}

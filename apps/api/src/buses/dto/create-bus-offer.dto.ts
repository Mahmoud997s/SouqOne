import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusOfferDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  proposedPrice?: number;
}

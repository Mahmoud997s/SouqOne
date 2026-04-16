import { IsEnum } from 'class-validator';
import { BusOfferStatus } from '@prisma/client';

export class UpdateBusOfferDto {
  @IsEnum(BusOfferStatus)
  status!: BusOfferStatus;
}

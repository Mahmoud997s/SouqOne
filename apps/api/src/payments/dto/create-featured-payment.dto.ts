import { IsString, IsIn } from 'class-validator';

const ENTITY_TYPES = ['LISTING', 'BUS_LISTING', 'EQUIPMENT_LISTING'] as const;

export class CreateFeaturedPaymentDto {
  @IsIn(ENTITY_TYPES)
  entityType!: string;

  @IsString()
  entityId!: string;
}

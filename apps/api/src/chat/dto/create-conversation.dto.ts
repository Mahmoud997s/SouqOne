import { IsString, IsOptional, IsIn } from 'class-validator';

const ENTITY_TYPES = ['LISTING', 'SPARE_PART', 'CAR_SERVICE', 'TRANSPORT', 'TRIP', 'INSURANCE', 'JOB', 'EQUIPMENT_LISTING', 'EQUIPMENT_REQUEST', 'OPERATOR_LISTING'] as const;

export class CreateConversationDto {
  @IsIn(ENTITY_TYPES, { message: 'نوع الكيان غير صالح' })
  entityType!: string;

  @IsString({ message: 'معرف الكيان مطلوب' })
  entityId!: string;

  // Backward compat — old clients may still send listingId
  @IsOptional()
  @IsString()
  listingId?: string;
}

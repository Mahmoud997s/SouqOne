import { IsString, IsOptional, IsBoolean, IsNumber, Min, MinLength } from 'class-validator';

export class CreateEquipmentBidDto {
  @IsNumber() @Min(1, { message: 'السعر يجب أن يكون أكبر من 0' })
  price!: number;

  @IsString() @MinLength(2, { message: 'حدد التوفر' })
  availability!: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsBoolean()
  withOperator?: boolean;

  @IsOptional() @IsString()
  currency?: string;
}

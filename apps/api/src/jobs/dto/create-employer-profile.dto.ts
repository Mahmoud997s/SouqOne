import {
  IsString, IsOptional, MinLength,
} from 'class-validator';

export class CreateEmployerProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  bio?: string;

  @IsString()
  governorate!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;
}

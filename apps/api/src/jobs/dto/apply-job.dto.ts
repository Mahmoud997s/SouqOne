import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ApplyJobDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsUrl({}, { message: 'يجب أن يكون رابط صالح للسيرة الذاتية' })
  resumeUrl?: string;
}

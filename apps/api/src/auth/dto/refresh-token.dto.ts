import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'رمز التجديد مطلوب' })
  refreshToken!: string;
}

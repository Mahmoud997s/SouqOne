import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  credential!: string;

  @IsOptional()
  @IsString()
  nonce?: string;
}

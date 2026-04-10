import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  @MinLength(1, { message: 'محتوى الرسالة مطلوب' })
  content!: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

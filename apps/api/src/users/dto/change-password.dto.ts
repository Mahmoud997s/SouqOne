import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'كلمة المرور الحالية مطلوبة' })
  currentPassword!: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور الجديدة يجب أن تكون ٦ أحرف على الأقل' })
  newPassword!: string;
}

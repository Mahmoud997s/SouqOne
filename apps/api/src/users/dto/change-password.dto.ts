import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'كلمة المرور الحالية مطلوبة' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور الجديدة يجب أن تكون ٨ أحرف على الأقل' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, { message: 'كلمة المرور يجب أن تحتوي على حرف كبير ورقم على الأقل' })
  newPassword!: string;
}

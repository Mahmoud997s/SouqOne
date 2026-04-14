import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email!: string;

  @IsString()
  @MinLength(3, { message: 'اسم المستخدم يجب أن يكون ٣ أحرف على الأقل' })
  @MaxLength(30)
  username!: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, { message: 'كلمة المرور يجب أن تحتوي على حرف كبير ورقم على الأقل' })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

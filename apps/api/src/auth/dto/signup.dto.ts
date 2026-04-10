import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email!: string;

  @IsString()
  @MinLength(3, { message: 'اسم المستخدم يجب أن يكون ٣ أحرف على الأقل' })
  @MaxLength(30)
  username!: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل' })
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

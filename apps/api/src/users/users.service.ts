import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly publicSelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    governorate: true,
    isVerified: true,
    role: true,
    createdAt: true,
  };

  private readonly privateSelect = {
    ...this.publicSelect,
    email: true,
    phone: true,
    updatedAt: true,
  };

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.privateSelect,
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return user;
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...this.publicSelect,
        _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
      },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        phone: dto.phone,
        governorate: dto.governorate,
        avatarUrl: dto.avatarUrl,
      },
      select: this.privateSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('هذا الحساب مسجل بواسطة Google ولا يحتوي على كلمة مرور.');
    }
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}

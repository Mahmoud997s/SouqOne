// ──────────────────────────────────────
// أنواع المستخدم
// ──────────────────────────────────────

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  governorate?: string | null;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  phone?: string;
  governorate?: string;
}

export interface IUpdateUser {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  governorate?: string;
}

// المحافظات العمانية
export const OMAN_GOVERNORATES = [
  'مسقط',
  'ظفار',
  'مسندم',
  'البريمي',
  'الداخلية',
  'شمال الباطنة',
  'جنوب الباطنة',
  'شمال الشرقية',
  'جنوب الشرقية',
  'الظاهرة',
  'الوسطى',
] as const;

export type OmanGovernorate = (typeof OMAN_GOVERNORATES)[number];

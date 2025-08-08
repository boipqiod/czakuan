// Temporary enum until Prisma client is available
enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BOARD_ADMIN = 'BOARD_ADMIN',
  USER = 'USER',
}

export class UserEntity {
  id: number;
  email: string | null;
  nickName: string;
  profileImageUrl: string | null;
  createdAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
  name: string | null;
  phoneNumber: string | null;
  role: Role;
  kakaoId: bigint;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  isAdmin(): boolean {
    return this.role === Role.SUPER_ADMIN || this.role === Role.BOARD_ADMIN;
  }

  isSuperAdmin(): boolean {
    return this.role === Role.SUPER_ADMIN;
  }

  isBoardAdmin(): boolean {
    return this.role === Role.BOARD_ADMIN;
  }

  isActive(): boolean {
    return this.deletedAt === null;
  }
}
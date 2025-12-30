export type UserRole = "USER" | "BOARD_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: number;
  kakaoId: bigint;
  nickname: string;
  email: string | null;
  name: string | null;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserProfile {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: Date;
}

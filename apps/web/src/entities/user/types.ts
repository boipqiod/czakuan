export type UserRole = "USER" | "BOARD_ADMIN" | "SUPER_ADMIN";

export interface User {
  id: number;
  nickname: string;
  email: string | null;
  profileImageUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
}

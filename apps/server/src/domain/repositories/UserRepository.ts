import type { User, UserProfile } from "../entities/User";

export interface CreateUserData {
  kakaoId: bigint;
  nickname: string;
  email?: string;
  name?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface UpdateUserData {
  nickname?: string;
  profileImageUrl?: string;
}

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByKakaoId(kakaoId: bigint): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  findProfile(id: number): Promise<UserProfile | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: number, data: UpdateUserData): Promise<User>;
  existsByNickname(nickname: string, excludeId?: number): Promise<boolean>;
}

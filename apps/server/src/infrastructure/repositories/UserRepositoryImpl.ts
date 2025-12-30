import { prisma } from "@/infrastructure/db/prisma";
import type {
  UserRepository,
  CreateUserData,
  UpdateUserData,
} from "@/domain/repositories/UserRepository";
import type { User, UserProfile } from "@/domain/entities/User";

export class UserRepositoryImpl implements UserRepository {
  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    return user as User | null;
  }

  async findByKakaoId(kakaoId: bigint): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { kakaoId, deletedAt: null },
    });
    return user as User | null;
  }

  async findByNickname(nickname: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { nickname, deletedAt: null },
    });
    return user as User | null;
  }

  async findProfile(id: number): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });
    return user;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        kakaoId: data.kakaoId,
        nickname: data.nickname,
        email: data.email,
        name: data.name,
        phoneNumber: data.phoneNumber,
        profileImageUrl: data.profileImageUrl,
      },
    });
    return user as User;
  }

  async update(id: number, data: UpdateUserData): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user as User;
  }

  async existsByNickname(nickname: string, excludeId?: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        nickname,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
    return user !== null;
  }
}

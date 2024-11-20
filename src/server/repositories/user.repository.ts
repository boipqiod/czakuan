import prisma from '@/server/modules/prisma';

export class UserReopsitory {
  constructor() {}

  async getUserByKakaoId(kakaoId: number) {
    return prisma.user.findFirst({
      where: {
        kakaoId,
      },
    });
  }

  async getUserById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async getUserByNickName(nickName: string) {
    return prisma.user.findUnique({
      where: {
        nickName,
      },
    });
  }

  async createUser(
    kakaoId: number,
    nickName: string,
    name?: string,
    phoneNumber?: string,
    email?: string,
    profileImageUrl?: string,
  ) {
    return prisma.user.create({
      data: {
        kakaoId,
        name,
        phoneNumber,
        nickName,
        email,
        profileImageUrl,
      },
    });
  }

  async updateUser(id: number, nickName?: string, profileImageUrl?: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        nickName,
        profileImageUrl,
      },
    });
  }
}

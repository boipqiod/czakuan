import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        kakaoId: BigInt(createUserDto.kakaoId),
      },
    });
    return new UserEntity(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });
    return users.map(user => new UserEntity(user));
  }

  async findOne(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    return user ? new UserEntity(user) : null;
  }

  async findByKakaoId(kakaoId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { kakaoId: BigInt(kakaoId), deletedAt: null },
    });
    return user ? new UserEntity(user) : null;
  }

  async findByNickName(nickName: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { nickName, deletedAt: null },
    });
    return user ? new UserEntity(user) : null;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return new UserEntity(user);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
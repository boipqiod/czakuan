import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.post.findMany({
      where: { deletedAt: null },
      include: {
        author: true,
        category: true,
        subCategory: true,
        _count: {
          select: {
            comments: true,
            likes: true,
            dislikes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: true,
        category: true,
        subCategory: true,
        comments: {
          where: { deletedAt: null },
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            dislikes: true,
          },
        },
      },
    });
  }
}
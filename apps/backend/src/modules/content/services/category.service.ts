import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categoryGroup.findMany({
      where: { isUse: true },
      include: {
        categories: {
          where: { isUse: true },
          include: {
            subCategories: {
              where: { isUse: true },
            },
          },
          orderBy: { priority: 'asc' },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }
}
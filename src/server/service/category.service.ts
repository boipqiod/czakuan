import prisma from '@/server/modules/prisma';

export class CategoryService {
  constructor(private readonly prismaHelper = prisma) {}

  async getCategoriesOnlyUse() {
    const categories = await this.prismaHelper.category.findMany({
      where: {
        isUse: true,
      },
      orderBy: {
        priority: 'asc',
      },
      select: {
        id: true,
        name: true,
        subCategories: {
          orderBy: {
            priority: 'asc',
          },
          where: {
            isUse: true,
          },
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {categories};
  }
}

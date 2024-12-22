import prisma from '@/server/modules/prisma';

export class CategoryService {
  constructor(private readonly prismaHelper = prisma) {}

  async getCategoriesOnlyUse() {
    const categoryGroups = await this.prismaHelper.categoryGroup.findMany({
      orderBy: {
        priority: 'asc',
      },
      select: {
        id: true,
        name: true,
        categories: {
          where: {
            isUse: true,
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
          },
        },
      },
    });

    return {categoryGroups};
  }
}

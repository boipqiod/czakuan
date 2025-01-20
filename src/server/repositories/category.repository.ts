import prisma from '@/server/modules/prisma';

export class CategoryRepository {
  async getCategoriesOnlyUse() {
    const categoryGroups = await prisma.categoryGroup.findMany({
      orderBy: {
        priority: 'asc',
      },
      select: {
        id: true,
        name: true,
        categories: {
          orderBy: {
            priority: 'asc',
          },
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

  getRecentCategories() {
    return prisma.post.findMany({
      where: {
        // 제외할 조건들
        isAnonymous: false, // 익명 게시글 제외
        isNotice: false, // 공지사항 제외
        deletedAt: null, // 삭제된 게시글 제외

        // 카테고리가 사용 중이고 익명카테고리가 아닌 것만
        category: {
          isUse: true,
          isAnonymous: false,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['categoryId'], // 서로 다른 카테고리만
      take: 3, // 3개만 가져오기
      select: {
        category: true,
      },
    });
  }
}

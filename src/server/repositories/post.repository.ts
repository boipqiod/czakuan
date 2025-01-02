import prisma from '@/server/modules/prisma';

export class PostRepository {
  private readonly postSelectFields = {
    id: true,
    categoryId: true,
    subCategoryId: true,
    isNotice: true,
    title: true,
    content: true,
    thumbnailUrl: true,
    views: true,
    reports: true,
    updatedAt: true,
    createdAt: true,
    _count: {
      select: {
        comments: true,
        dislikes: true,
        likes: true,
      },
    },
    author: {
      select: {
        id: true,
        nickName: true,
        profileImageUrl: true,
        role: true,
      },
    },
  };

  getCount(categoryId?: number, subCategoryId?: number) {
    return prisma.post.count({
      where: {
        isNotice: false,
        deletedAt: null,
        categoryId,
        subCategoryId,
      },
    });
  }

  getList(
    page: number,
    limit: number,
    categoryId?: number,
    subCategoryId?: number,
  ) {
    const skip = (page - 1) * limit;

    return prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isNotice: false,
        deletedAt: null,
        categoryId,
        subCategoryId,
      },
      select: this.postSelectFields,
    });
  }

  getPopularList(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      where: {
        isNotice: false,
        deletedAt: null,
        createdAt: {
          gte: oneMonthAgo,
        },
      },
      select: this.postSelectFields,
    });
  }

  getPopularCount() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return prisma.post.count({
      where: {
        isNotice: false,
        deletedAt: null,
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });
  }

  getNoticeList(categoryId?: number) {
    return prisma.post.findMany({
      where: {
        deletedAt: null,
        categoryId: categoryId ?? 1,
        isNotice: true,
      },
      select: this.postSelectFields,
    });
  }

  getDetail(postId: number) {
    return prisma.post.findUnique({
      where: {
        deletedAt: null,
        id: postId,
      },
      select: {
        id: true,
        categoryId: true,
        subCategoryId: true,
        title: true,
        content: true,
        views: true,
        likes: true,
        dislikes: true,
        reports: true,
        updatedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            nickName: true,
            profileImageUrl: true,
            role: true,
          },
        },
      },
    });
  }

  create(
    userId: number,
    title: string,
    content: string,
    categoryId: number,
    subCategoryId?: number,
    isNotice?: boolean,
  ) {
    return prisma.post.create({
      data: {
        userId,
        title,
        content,
        isNotice,
        categoryId,
        subCategoryId,
      },
      select: {id: true},
    });
  }

  update(
    postId: number,
    updateData: {
      thumbnailUrl?: string;
      content?: string;
      images?: string[];
    },
  ) {
    return prisma.post.update({
      where: {id: postId},
      data: {
        thumbnailUrl: updateData.thumbnailUrl,
        content: updateData.content,
        images: updateData.images,
      },
      select: {id: true},
    });
  }

  async delete(postId: number, userId: number) {
    // 소프트 딜리트
    return prisma.post.update({
      where: {id: postId, userId: userId},
      data: {
        deletedAt: new Date(),
      },
      select: {id: true},
    });
  }

  report(postId: number, userId: number, reason: string) {
    return prisma.reportToPost.create({
      data: {
        postId,
        userId,
        reason,
      },
    });
  }

  reportCount() {
    return prisma.reportToPost.count();
  }

  reportList(page: number, limit: number) {
    return prisma.reportToPost.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        postId: true,
        userId: true,
        reason: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            role: true,
            nickName: true,
            profileImageUrl: true,
          },
        },
      },
    });
  }
}

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
    updatedAt: true,
    createdAt: true,
    images: true,
    likes: {
      select: {
        userId: true,
      },
    },
    dislikes: {
      select: {
        userId: true,
      },
    },
    reports: {
      select: {
        userId: true,
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
  private readonly postListSelectFields = {
    id: true,
    categoryId: true,
    subCategoryId: true,
    isNotice: true,
    title: true,
    thumbnailUrl: true,
    views: true,
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
  private readonly postListSelectFieldsWithAnonym = {
    ...this.postListSelectFields,
    isAnonymous: true,
    AnonymousUserInPost: true,
  };
  private readonly postSelectFieldsWithAnonym = {
    ...this.postSelectFields,
    isAnonymous: true,
    AnonymousUserInPost: true,
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
        // isAnonymous: !categoryId ? false : undefined, // 특정 카테고리가 아닌 경우 익명 글 제외, 익명 카테고리로 올라오는 경우만
      },
      select: this.postListSelectFieldsWithAnonym,
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
        isAnonymous: false,
      },
      select: this.postListSelectFields,
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
        isAnonymous: false,
      },
    });
  }

  getNoticeList(categoryId?: number) {
    return prisma.post.findMany({
      where: {
        deletedAt: null,
        categoryId: categoryId ?? 1,
        isNotice: true,
        isAnonymous: false,
      },
      select: this.postListSelectFields,
    });
  }

  getDetail(postId: number) {
    return prisma.post.findUnique({
      where: {
        deletedAt: null,
        id: postId,
      },
      select: this.postSelectFieldsWithAnonym,
    });
  }

  getPostWithUser(userId: number, id: number) {
    return prisma.post.findUnique({
      where: {
        deletedAt: null,
        id,
        userId,
      },
      select: this.postSelectFields,
    });
  }

  create(
    userId: number,
    title: string,
    content: string,
    categoryId: number,
    isAnonymous: boolean,
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
        isAnonymous,
      },
      select: {id: true},
    });
  }

  update(
    postId: number,
    updateData: {
      title?: string;
      thumbnailUrl?: string;
      content?: string;
      images?: string[];
    },
  ) {
    return prisma.post.update({
      where: {id: postId},
      data: {
        title: updateData.title,
        thumbnailUrl: updateData.thumbnailUrl,
        content: updateData.content,
        images: updateData.images,
      },
      select: {id: true},
    });
  }

  updateWithUser(
    userId: number,
    id: number,
    title: string,
    content: string,
    images: string[],
  ) {
    return prisma.post.update({
      where: {id, userId},
      data: {
        title,
        content,
        images,
      },
      select: {id: true},
    });
  }

  delete(postId: number, userId: number) {
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

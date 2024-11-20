import prisma from '@/server/modules/prisma';

export class CommentRepository {
  private readonly commentEntitySelect = {
    id: true,
    postId: true,
    content: true,
    likes: true,
    dislikes: true,
    reports: true,
    parentId: true,
    rootId: true,
    updatedAt: true,
    createdAt: true,
    deletedAt: true,
    author: {
      select: {
        id: true,
        nickName: true,
        profileImageUrl: true,
        role: true,
      },
    },
  };

  getDetail(id: number) {
    return prisma.comment.findUnique({
      where: {
        id,
      },
      select: this.commentEntitySelect,
    });
  }

  getList(postId: number, limit: number, page: number) {
    const _page = page <= 0 ? 1 : page;
    const offset = (_page - 1) * limit;
    return prisma.comment.findMany({
      where: {
        postId,
      },
      skip: offset,
      take: limit,
      orderBy: [{rootId: 'asc'}, {id: 'asc'}],
      select: this.commentEntitySelect,
    });
  }

  getCount(postId: number) {
    return prisma.comment.count({
      where: {
        postId,
      },
    });
  }

  async getLastPage(postId: number, limit: number) {
    const total = await this.getCount(postId);
    return Math.ceil(total / limit);
  }

  create(
    postId: number,
    userId: number,
    content: string,
    parentId?: number,
    rootId?: number,
  ) {
    return prisma.comment.create({
      data: {
        postId,
        userId,
        content,
        parentId,
        rootId: rootId ?? 0,
      },
      select: this.commentEntitySelect,
    });
  }

  updateRootId(id: number, rootId: number) {
    return prisma.comment.update({
      where: {
        id,
      },
      data: {
        rootId,
      },
      select: this.commentEntitySelect,
    });
  }

  getLike(id: number, userId: number) {
    return prisma.likeToComment.findUnique({
      where: {
        userId_commentId: {
          commentId: id,
          userId,
        },
      },
    });
  }

  createLike(id: number, userId: number) {
    return prisma.likeToComment.create({
      data: {
        commentId: id,
        userId,
      },
    });
  }

  deleteLike(id: number, userId: number) {
    return prisma.likeToComment.delete({
      where: {
        userId_commentId: {
          commentId: id,
          userId,
        },
      },
    });
  }

  getDislike(id: number, userId: number) {
    return prisma.dislikeToComment.findUnique({
      where: {
        userId_commentId: {
          commentId: id,
          userId,
        },
      },
    });
  }

  createDislike(id: number, userId: number) {
    return prisma.dislikeToComment.create({
      data: {
        commentId: id,
        userId,
      },
    });
  }

  deleteDislike(id: number, userId: number) {
    return prisma.dislikeToComment.delete({
      where: {
        userId_commentId: {
          commentId: id,
          userId,
        },
      },
    });
  }

  delete(id: number, userId: number) {
    return prisma.comment.update({
      where: {
        id,
        userId,
      },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
      },
    });
  }
}

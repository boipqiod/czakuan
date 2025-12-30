import { prisma } from "@/infrastructure/db/prisma";
import type {
  CommentRepository,
  CommentListParams,
} from "@/domain/repositories/CommentRepository";
import type { Comment, CommentListItem, CreateCommentInput } from "@/domain/entities/Comment";

interface CommentQueryResult {
  id: number;
  content: string;
  parentId: number | null;
  rootId: number;
  likeCount: number;
  dislikeCount: number;
  isPrivate: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  user: {
    id: number;
    nickname: string;
    profileImageUrl: string | null;
    createdAt: Date;
  };
}

export class CommentRepositoryImpl implements CommentRepository {
  async findById(id: number): Promise<Comment | null> {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });
    return comment as Comment | null;
  }

  async findList(params: CommentListParams): Promise<CommentListItem[]> {
    const { postId, page, limit, userId } = params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ rootId: "asc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    const commentItems: CommentListItem[] = [];

    for (const comment of comments) {
      let myReaction = null;
      if (userId) {
        const [like, dislike] = await Promise.all([
          prisma.likeToComment.findUnique({
            where: { userId_commentId: { userId, commentId: comment.id } },
          }),
          prisma.dislikeToComment.findUnique({
            where: { userId_commentId: { userId, commentId: comment.id } },
          }),
        ]);
        myReaction = { liked: !!like, disliked: !!dislike };
      }

      commentItems.push({
        id: comment.id,
        content: comment.deletedAt ? "" : comment.content,
        parentId: comment.parentId,
        rootId: comment.rootId,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        isPrivate: comment.isPrivate,
        isDeleted: comment.deletedAt !== null,
        createdAt: comment.createdAt,
        author: {
          id: comment.user.id,
          nickname: comment.user.nickname,
          profileImageUrl: comment.user.profileImageUrl,
          createdAt: comment.user.createdAt,
        },
        anonymousId: null,
        parentAnonymousId: null,
        myReaction,
        canView: true,
      });
    }

    return commentItems;
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<CommentListItem[]> {
    const comments = await prisma.comment.findMany({
      where: { userId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return comments.map((comment: CommentQueryResult) => ({
      id: comment.id,
      content: comment.content,
      parentId: comment.parentId,
      rootId: comment.rootId,
      likeCount: comment.likeCount,
      dislikeCount: comment.dislikeCount,
      isPrivate: comment.isPrivate,
      isDeleted: false,
      createdAt: comment.createdAt,
      author: {
        id: comment.user.id,
        nickname: comment.user.nickname,
        profileImageUrl: comment.user.profileImageUrl,
        createdAt: comment.user.createdAt,
      },
      anonymousId: null,
      parentAnonymousId: null,
      myReaction: null,
      canView: true,
    }));
  }

  async count(postId: number): Promise<number> {
    return prisma.comment.count({
      where: { postId, deletedAt: null },
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return prisma.comment.count({
      where: { userId, deletedAt: null },
    });
  }

  async create(userId: number, data: CreateCommentInput): Promise<Comment> {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        userId,
        parentId: data.parentId,
        rootId: 0,
        isPrivate: data.isPrivate ?? false,
      },
    });
    return comment as Comment;
  }

  async softDelete(id: number): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateRootId(id: number, rootId: number): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { rootId },
    });
  }
}

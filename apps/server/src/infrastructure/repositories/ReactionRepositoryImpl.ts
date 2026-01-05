import { prisma } from "@/infrastructure/db/prisma";
import type { ReactionRepository } from "@/domain/repositories/ReactionRepository";
import type { Report, ReportTargetType, AnonymousUserInPost } from "@/domain/entities/Reaction";
import { generateAnonymousId, getNextAnonymousSequence } from "@/domain/rules/anonymousRules";

interface ReportToPostResult {
  id: number;
  userId: number;
  postId: number;
  reason: string;
  createdAt: Date;
}

interface ReportToCommentResult {
  id: number;
  userId: number;
  commentId: number;
  reason: string;
  createdAt: Date;
}

export class ReactionRepositoryImpl implements ReactionRepository {
  // Post reactions
  async findPostReactions(userId: number, postId: number): Promise<{ liked: boolean; disliked: boolean }> {
    const [like, dislike] = await Promise.all([
      prisma.likeToPost.findUnique({
        where: { userId_postId: { userId, postId } },
      }),
      prisma.dislikeToPost.findUnique({
        where: { userId_postId: { userId, postId } },
      }),
    ]);
    return { liked: !!like, disliked: !!dislike };
  }

  async createPostLike(userId: number, postId: number): Promise<number> {
    const [, post] = await prisma.$transaction([
      prisma.likeToPost.create({
        data: { userId, postId },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return post.likeCount;
  }

  async deletePostLike(userId: number, postId: number): Promise<number> {
    const [, post] = await prisma.$transaction([
      prisma.likeToPost.delete({
        where: { userId_postId: { userId, postId } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return post.likeCount;
  }

  async createPostDislike(userId: number, postId: number): Promise<number> {
    const [, post] = await prisma.$transaction([
      prisma.dislikeToPost.create({
        data: { userId, postId },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { dislikeCount: { increment: 1 } },
      }),
    ]);
    return post.dislikeCount;
  }

  async deletePostDislike(userId: number, postId: number): Promise<number> {
    const [, post] = await prisma.$transaction([
      prisma.dislikeToPost.delete({
        where: { userId_postId: { userId, postId } },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { dislikeCount: { decrement: 1 } },
      }),
    ]);
    return post.dislikeCount;
  }

  async hasPostLike(userId: number, postId: number): Promise<boolean> {
    const like = await prisma.likeToPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return !!like;
  }

  async hasPostDislike(userId: number, postId: number): Promise<boolean> {
    const dislike = await prisma.dislikeToPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return !!dislike;
  }

  // Comment reactions
  async findCommentReactions(userId: number, commentId: number): Promise<{ liked: boolean; disliked: boolean }> {
    const [like, dislike] = await Promise.all([
      prisma.likeToComment.findUnique({
        where: { userId_commentId: { userId, commentId } },
      }),
      prisma.dislikeToComment.findUnique({
        where: { userId_commentId: { userId, commentId } },
      }),
    ]);
    return { liked: !!like, disliked: !!dislike };
  }

  async createCommentLike(userId: number, commentId: number): Promise<number> {
    const [, comment] = await prisma.$transaction([
      prisma.likeToComment.create({
        data: { userId, commentId },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return comment.likeCount;
  }

  async deleteCommentLike(userId: number, commentId: number): Promise<number> {
    const [, comment] = await prisma.$transaction([
      prisma.likeToComment.delete({
        where: { userId_commentId: { userId, commentId } },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return comment.likeCount;
  }

  async createCommentDislike(userId: number, commentId: number): Promise<number> {
    const [, comment] = await prisma.$transaction([
      prisma.dislikeToComment.create({
        data: { userId, commentId },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { dislikeCount: { increment: 1 } },
      }),
    ]);
    return comment.dislikeCount;
  }

  async deleteCommentDislike(userId: number, commentId: number): Promise<number> {
    const [, comment] = await prisma.$transaction([
      prisma.dislikeToComment.delete({
        where: { userId_commentId: { userId, commentId } },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { dislikeCount: { decrement: 1 } },
      }),
    ]);
    return comment.dislikeCount;
  }

  async hasCommentLike(userId: number, commentId: number): Promise<boolean> {
    const like = await prisma.likeToComment.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    return !!like;
  }

  async hasCommentDislike(userId: number, commentId: number): Promise<boolean> {
    const dislike = await prisma.dislikeToComment.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    return !!dislike;
  }

  // Reports
  async findReport(userId: number, targetType: ReportTargetType, targetId: number): Promise<Report | null> {
    if (targetType === "POST") {
      const report = await prisma.reportToPost.findUnique({
        where: { userId_postId: { userId, postId: targetId } },
      });
      if (!report) return null;
      return {
        id: report.id,
        userId: report.userId,
        targetType: "POST",
        targetId: report.postId,
        reason: report.reason,
        createdAt: report.createdAt,
      };
    } else {
      const report = await prisma.reportToComment.findUnique({
        where: { userId_commentId: { userId, commentId: targetId } },
      });
      if (!report) return null;
      return {
        id: report.id,
        userId: report.userId,
        targetType: "COMMENT",
        targetId: report.commentId,
        reason: report.reason,
        createdAt: report.createdAt,
      };
    }
  }

  async createReport(userId: number, targetType: ReportTargetType, targetId: number, reason: string): Promise<Report> {
    if (targetType === "POST") {
      const report = await prisma.reportToPost.create({
        data: { userId, postId: targetId, reason },
      });
      return {
        id: report.id,
        userId: report.userId,
        targetType: "POST",
        targetId: report.postId,
        reason: report.reason,
        createdAt: report.createdAt,
      };
    } else {
      const report = await prisma.reportToComment.create({
        data: { userId, commentId: targetId, reason },
      });
      return {
        id: report.id,
        userId: report.userId,
        targetType: "COMMENT",
        targetId: report.commentId,
        reason: report.reason,
        createdAt: report.createdAt,
      };
    }
  }

  async findReportedPosts(page: number, limit: number): Promise<Report[]> {
    const reports = await prisma.reportToPost.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return reports.map((r: ReportToPostResult) => ({
      id: r.id,
      userId: r.userId,
      targetType: "POST" as const,
      targetId: r.postId,
      reason: r.reason,
      createdAt: r.createdAt,
    }));
  }

  async findReportedComments(page: number, limit: number): Promise<Report[]> {
    const reports = await prisma.reportToComment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return reports.map((r: ReportToCommentResult) => ({
      id: r.id,
      userId: r.userId,
      targetType: "COMMENT" as const,
      targetId: r.commentId,
      reason: r.reason,
      createdAt: r.createdAt,
    }));
  }

  async countReportedPosts(): Promise<number> {
    return prisma.reportToPost.count();
  }

  async countReportedComments(): Promise<number> {
    return prisma.reportToComment.count();
  }

  // Anonymous
  async findAnonymousId(userId: number, postId: number): Promise<string | null> {
    const anon = await prisma.anonymousUserInPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return anon?.anonymousId ?? null;
  }

  async findOrCreateAnonymousId(userId: number, postId: number): Promise<string> {
    const existing = await this.findAnonymousId(userId, postId);
    if (existing) return existing;

    const allAnons = await prisma.anonymousUserInPost.findMany({
      where: { postId },
      select: { anonymousId: true },
    });

    const existingIds = allAnons.map((a: { anonymousId: string }) => a.anonymousId);
    const sequence = getNextAnonymousSequence(existingIds);
    const anonymousId = generateAnonymousId(sequence);

    await prisma.anonymousUserInPost.create({
      data: { userId, postId, anonymousId },
    });

    return anonymousId;
  }

  async findAnonymousIdsInPost(postId: number): Promise<AnonymousUserInPost[]> {
    return prisma.anonymousUserInPost.findMany({
      where: { postId },
    });
  }
}

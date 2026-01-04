import type { CommentRepository } from "@/domain/repositories/CommentRepository";
import type { PostRepository } from "@/domain/repositories/PostRepository";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { ReactionRepository } from "@/domain/repositories/ReactionRepository";
import { CommentRepositoryImpl } from "@/infrastructure/repositories/CommentRepositoryImpl";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import { ReactionRepositoryImpl } from "@/infrastructure/repositories/ReactionRepositoryImpl";
import { validateComment, canDeleteComment, canViewPrivateComment, getDeletedCommentText, getPrivateCommentText } from "@/domain/rules/commentRules";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { Comment, CommentListItem } from "@/domain/entities/Comment";
import type { UserRole } from "@/domain/entities/User";
import type { Post } from "@/domain/entities/Post";

export interface CommentListResult {
  comments: CommentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CommentService {
  private commentRepository: CommentRepository;
  private postRepository: PostRepository;
  private categoryRepository: CategoryRepository;
  private reactionRepository: ReactionRepository;

  constructor() {
    this.commentRepository = new CommentRepositoryImpl();
    this.postRepository = new PostRepositoryImpl();
    this.categoryRepository = new CategoryRepositoryImpl();
    this.reactionRepository = new ReactionRepositoryImpl();
  }

  async getCommentList(
    postId: number,
    page: number,
    limit: number,
    userId?: number,
    userRole?: UserRole
  ): Promise<CommentListResult> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    const [comments, total] = await Promise.all([
      this.commentRepository.findList({ postId, page, limit, userId }),
      this.commentRepository.count(postId),
    ]);

    const processedComments = await this.processComments(
      comments,
      post,
      userId ?? null,
      userRole ?? null
    );

    return {
      comments: processedComments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(
    userId: number,
    postId: number,
    content: string,
    parentId?: number,
    isPrivate?: boolean
  ): Promise<Comment> {
    const validation = validateComment(content);
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.COMMENT_INVALID_CONTENT, validation.message);
    }

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    let rootId: number | undefined;
    if (parentId) {
      const parent = await this.commentRepository.findById(parentId);
      if (!parent || parent.postId !== postId) {
        throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND, "부모 댓글을 찾을 수 없습니다.");
      }
      rootId = parent.rootId;
    }

    const comment = await this.commentRepository.create(userId, {
      content,
      postId,
      parentId,
      isPrivate: isPrivate ?? false,
    });

    const finalRootId = rootId ?? comment.id;
    await this.commentRepository.updateRootId(comment.id, finalRootId);

    const category = await this.categoryRepository.findCategoryById(post.categoryId);
    if (category?.isAnonymous) {
      await this.reactionRepository.findOrCreateAnonymousId(userId, postId);
    }

    return { ...comment, rootId: finalRootId };
  }

  async deleteComment(commentId: number, userId: number, userRole: UserRole): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    if (!canDeleteComment(comment, userId, userRole)) {
      throw new DomainError(ErrorCodes.COMMENT_FORBIDDEN);
    }

    await this.commentRepository.softDelete(commentId);
  }

  async toggleLike(commentId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    const hasLike = await this.reactionRepository.hasCommentLike(userId, commentId);

    if (hasLike) {
      const likeCount = await this.reactionRepository.deleteCommentLike(userId, commentId);
      return { liked: false, likeCount };
    } else {
      const likeCount = await this.reactionRepository.createCommentLike(userId, commentId);
      return { liked: true, likeCount };
    }
  }

  async toggleDislike(commentId: number, userId: number): Promise<{ disliked: boolean; dislikeCount: number }> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    const hasDislike = await this.reactionRepository.hasCommentDislike(userId, commentId);

    if (hasDislike) {
      const dislikeCount = await this.reactionRepository.deleteCommentDislike(userId, commentId);
      return { disliked: false, dislikeCount };
    } else {
      const dislikeCount = await this.reactionRepository.createCommentDislike(userId, commentId);
      return { disliked: true, dislikeCount };
    }
  }

  async reportComment(commentId: number, userId: number, reason: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new DomainError(ErrorCodes.COMMENT_NOT_FOUND);
    }

    if (comment.userId === userId) {
      throw new DomainError(ErrorCodes.CANNOT_REPORT_OWN);
    }

    if (!reason.trim()) {
      throw new DomainError(ErrorCodes.REPORT_REASON_REQUIRED);
    }

    const existing = await this.reactionRepository.findReport(userId, "COMMENT", commentId);
    if (existing) {
      throw new DomainError(ErrorCodes.ALREADY_REPORTED);
    }

    await this.reactionRepository.createReport(userId, "COMMENT", commentId, reason);
  }

  private async processComments(
    comments: CommentListItem[],
    post: Post,
    userId: number | null,
    userRole: UserRole | null
  ): Promise<CommentListItem[]> {
    const category = await this.categoryRepository.findCategoryById(post.categoryId);
    const isAnonymous = category?.isAnonymous ?? false;

    let anonymousMap = new Map<number, string>();
    if (isAnonymous) {
      const anonymousIds = await this.reactionRepository.findAnonymousIdsInPost(post.id);
      anonymousIds.forEach((a) => anonymousMap.set(a.userId, a.anonymousId));
    }

    return comments.map((comment) => {
      if (comment.isDeleted) {
        return {
          ...comment,
          content: getDeletedCommentText(),
          author: null,
          anonymousId: null,
        };
      }

      const commentForCheck: Comment = {
        id: comment.id,
        content: comment.content,
        postId: post.id,
        userId: comment.author?.id ?? 0,
        parentId: comment.parentId,
        rootId: comment.rootId,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
        isPrivate: comment.isPrivate,
        createdAt: comment.createdAt,
        updatedAt: comment.createdAt,
        deletedAt: null,
      };

      const canView = canViewPrivateComment(
        commentForCheck,
        userId,
        post.userId,
        userRole
      );

      if (comment.isPrivate && !canView) {
        return {
          ...comment,
          content: getPrivateCommentText(),
          author: null,
          anonymousId: null,
          canView: false,
        };
      }

      if (isAnonymous) {
        const authorId = comment.author?.id;
        return {
          ...comment,
          author: null,
          anonymousId: authorId ? anonymousMap.get(authorId) ?? null : null,
          canView: true,
        };
      }

      return { ...comment, canView: true };
    });
  }
}

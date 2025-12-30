import type {
  Report,
  ReportTargetType,
  AnonymousUserInPost,
} from "../entities/Reaction";

export interface ReactionRepository {
  // Post reactions
  findPostReactions(userId: number, postId: number): Promise<{ liked: boolean; disliked: boolean }>;
  createPostLike(userId: number, postId: number): Promise<void>;
  deletePostLike(userId: number, postId: number): Promise<void>;
  createPostDislike(userId: number, postId: number): Promise<void>;
  deletePostDislike(userId: number, postId: number): Promise<void>;
  hasPostLike(userId: number, postId: number): Promise<boolean>;
  hasPostDislike(userId: number, postId: number): Promise<boolean>;

  // Comment reactions
  findCommentReactions(userId: number, commentId: number): Promise<{ liked: boolean; disliked: boolean }>;
  createCommentLike(userId: number, commentId: number): Promise<void>;
  deleteCommentLike(userId: number, commentId: number): Promise<void>;
  createCommentDislike(userId: number, commentId: number): Promise<void>;
  deleteCommentDislike(userId: number, commentId: number): Promise<void>;
  hasCommentLike(userId: number, commentId: number): Promise<boolean>;
  hasCommentDislike(userId: number, commentId: number): Promise<boolean>;

  // Reports
  findReport(userId: number, targetType: ReportTargetType, targetId: number): Promise<Report | null>;
  createReport(userId: number, targetType: ReportTargetType, targetId: number, reason: string): Promise<Report>;
  findReportedPosts(page: number, limit: number): Promise<Report[]>;
  findReportedComments(page: number, limit: number): Promise<Report[]>;
  countReportedPosts(): Promise<number>;
  countReportedComments(): Promise<number>;

  // Anonymous
  findAnonymousId(userId: number, postId: number): Promise<string | null>;
  findOrCreateAnonymousId(userId: number, postId: number): Promise<string>;
  findAnonymousIdsInPost(postId: number): Promise<AnonymousUserInPost[]>;
}

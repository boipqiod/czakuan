export type ReactionType = "LIKE" | "DISLIKE";
export type ReportTargetType = "POST" | "COMMENT";

export interface PostReaction {
  userId: number;
  postId: number;
  type: ReactionType;
}

export interface CommentReaction {
  userId: number;
  commentId: number;
  type: ReactionType;
}

export interface Report {
  id: number;
  userId: number;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  createdAt: Date;
}

export interface AnonymousUserInPost {
  userId: number;
  postId: number;
  anonymousId: string;
}

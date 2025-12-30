import type { UserProfile } from "./User";

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  parentId: number | null;
  rootId: number;
  likeCount: number;
  dislikeCount: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CommentListItem {
  id: number;
  content: string;
  parentId: number | null;
  rootId: number;
  likeCount: number;
  dislikeCount: number;
  isPrivate: boolean;
  isDeleted: boolean;
  createdAt: Date;
  author: UserProfile | null;
  anonymousId: string | null;
  parentAnonymousId: string | null;
  myReaction: {
    liked: boolean;
    disliked: boolean;
  } | null;
  canView: boolean;
}

export interface CreateCommentInput {
  content: string;
  postId: number;
  parentId?: number;
  isPrivate?: boolean;
}

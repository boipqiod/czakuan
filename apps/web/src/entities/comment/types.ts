import type { UserProfile } from "../user/types";

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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
  createdAt: string;
  author: UserProfile | null;
  anonymousId: string | null;
  parentAnonymousId: string | null;
  myReaction: {
    liked: boolean;
    disliked: boolean;
  } | null;
  canView: boolean;
}

export interface CommentListResult {
  comments: CommentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCommentInput {
  postId: number;
  content: string;
  parentId?: number;
  isPrivate?: boolean;
}

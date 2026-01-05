import type { Comment, CommentListItem, CreateCommentInput } from "../entities/Comment";

export interface CommentListParams {
  postId: number;
  page: number;
  limit: number;
  userId?: number;
}

export interface CommentRepository {
  findById(id: number): Promise<Comment | null>;
  findList(params: CommentListParams): Promise<CommentListItem[]>;
  findByUserId(userId: number, page: number, limit: number): Promise<CommentListItem[]>;
  count(postId: number): Promise<number>;
  countByUserId(userId: number): Promise<number>;
  create(userId: number, data: CreateCommentInput): Promise<Comment>;
  softDelete(id: number): Promise<void>;
  updateRootId(id: number, rootId: number): Promise<void>;
}

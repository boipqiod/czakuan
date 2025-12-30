import type { Post, PostListItem, PostDetail, CreatePostInput, UpdatePostInput } from "../entities/Post";

export interface PostListParams {
  categoryId?: number;
  subCategoryId?: number;
  page: number;
  limit: number;
}

export interface PostRepository {
  findById(id: number): Promise<Post | null>;
  findDetail(id: number, userId?: number): Promise<PostDetail | null>;
  findList(params: PostListParams): Promise<PostListItem[]>;
  findNoticeList(categoryId: number): Promise<PostListItem[]>;
  findPopularList(page: number, limit: number): Promise<PostListItem[]>;
  findRecentByCategories(categoryIds: number[], limit: number): Promise<Map<number, PostListItem[]>>;
  findByUserId(userId: number, page: number, limit: number): Promise<PostListItem[]>;
  count(params: { categoryId?: number; subCategoryId?: number }): Promise<number>;
  countByUserId(userId: number): Promise<number>;
  create(userId: number, data: CreatePostInput, isAnonymous: boolean): Promise<Post>;
  update(id: number, data: UpdatePostInput): Promise<Post>;
  softDelete(id: number): Promise<void>;
  incrementViews(id: number): Promise<void>;
}

import type { PostRepository } from "@/domain/repositories/PostRepository";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type { ReactionRepository } from "@/domain/repositories/ReactionRepository";
import { PostRepositoryImpl } from "@/infrastructure/repositories/PostRepositoryImpl";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import { ReactionRepositoryImpl } from "@/infrastructure/repositories/ReactionRepositoryImpl";
import { validatePost, canEditPost, canDeletePost, canCreateNotice } from "@/domain/rules/postRules";
import { DomainError } from "@/domain/errors/DomainError";
import { ErrorCodes } from "@/domain/errors/ErrorCodes";
import type { Post, PostListItem, PostDetail } from "@/domain/entities/Post";
import type { UserRole } from "@/domain/entities/User";
import type { CreatePostDto, UpdatePostDto } from "./dto/CreatePostDto";

export interface PostListResult {
  posts: PostListItem[];
  notices: PostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PostService {
  private postRepository: PostRepository;
  private categoryRepository: CategoryRepository;
  private reactionRepository: ReactionRepository;

  constructor() {
    this.postRepository = new PostRepositoryImpl();
    this.categoryRepository = new CategoryRepositoryImpl();
    this.reactionRepository = new ReactionRepositoryImpl();
  }

  async getPostList(params: {
    categoryId?: number;
    subCategoryId?: number;
    page: number;
    limit: number;
  }): Promise<PostListResult> {
    const { categoryId, page, limit } = params;

    const [posts, notices, total] = await Promise.all([
      this.postRepository.findList(params),
      categoryId ? this.postRepository.findNoticeList(categoryId) : Promise.resolve([]),
      this.postRepository.count(params),
    ]);

    return {
      posts,
      notices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPostDetail(postId: number, userId?: number): Promise<PostDetail> {
    const post = await this.postRepository.findDetail(postId, userId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }
    return post;
  }

  async incrementViews(postId: number): Promise<void> {
    await this.postRepository.incrementViews(postId);
  }

  async createPost(userId: number, userRole: UserRole, dto: CreatePostDto): Promise<Post> {
    const validation = validatePost({ title: dto.title, content: dto.content });
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.VALIDATION_ERROR, validation.message);
    }

    const category = await this.categoryRepository.findCategoryById(dto.categoryId);
    if (!category || !category.isUse) {
      throw new DomainError(ErrorCodes.CATEGORY_NOT_FOUND);
    }

    if (dto.isNotice && !canCreateNotice(userRole)) {
      throw new DomainError(ErrorCodes.AUTH_FORBIDDEN, "공지사항은 관리자만 작성할 수 있습니다.");
    }

    const post = await this.postRepository.create(userId, {
      ...dto,
      isNotice: dto.isNotice ?? false,
    }, category.isAnonymous);

    if (category.isAnonymous) {
      await this.reactionRepository.findOrCreateAnonymousId(userId, post.id);
    }

    return post;
  }

  async updatePost(
    postId: number,
    userId: number,
    _userRole: UserRole,
    dto: UpdatePostDto
  ): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    if (!canEditPost(post, userId)) {
      throw new DomainError(ErrorCodes.POST_FORBIDDEN);
    }

    const validation = validatePost({
      title: dto.title ?? post.title,
      content: dto.content ?? post.content,
    });
    if (!validation.valid) {
      throw new DomainError(ErrorCodes.VALIDATION_ERROR, validation.message);
    }

    return this.postRepository.update(postId, dto);
  }

  async deletePost(postId: number, userId: number, userRole: UserRole): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    if (!canDeletePost(post, userId, userRole)) {
      throw new DomainError(ErrorCodes.POST_FORBIDDEN);
    }

    await this.postRepository.softDelete(postId);
  }

  async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    const hasLike = await this.reactionRepository.hasPostLike(userId, postId);

    if (hasLike) {
      await this.reactionRepository.deletePostLike(userId, postId);
      return { liked: false, likeCount: post.likeCount - 1 };
    } else {
      await this.reactionRepository.createPostLike(userId, postId);
      return { liked: true, likeCount: post.likeCount + 1 };
    }
  }

  async toggleDislike(postId: number, userId: number): Promise<{ disliked: boolean; dislikeCount: number }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    const hasDislike = await this.reactionRepository.hasPostDislike(userId, postId);

    if (hasDislike) {
      await this.reactionRepository.deletePostDislike(userId, postId);
      return { disliked: false, dislikeCount: post.dislikeCount - 1 };
    } else {
      await this.reactionRepository.createPostDislike(userId, postId);
      return { disliked: true, dislikeCount: post.dislikeCount + 1 };
    }
  }

  async reportPost(postId: number, userId: number, reason: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new DomainError(ErrorCodes.POST_NOT_FOUND);
    }

    if (post.userId === userId) {
      throw new DomainError(ErrorCodes.CANNOT_REPORT_OWN);
    }

    if (!reason.trim()) {
      throw new DomainError(ErrorCodes.REPORT_REASON_REQUIRED);
    }

    const existing = await this.reactionRepository.findReport(userId, "POST", postId);
    if (existing) {
      throw new DomainError(ErrorCodes.ALREADY_REPORTED);
    }

    await this.reactionRepository.createReport(userId, "POST", postId, reason);
  }

  async getPopularPosts(page: number, limit: number): Promise<PostListItem[]> {
    return this.postRepository.findPopularList(page, limit);
  }
}

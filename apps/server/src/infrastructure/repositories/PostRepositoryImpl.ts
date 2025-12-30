import { prisma } from "@/infrastructure/db/prisma";
import type {
  PostRepository,
  PostListParams,
} from "@/domain/repositories/PostRepository";
import type { Post, PostListItem, PostDetail, CreatePostInput, UpdatePostInput } from "@/domain/entities/Post";

interface PostListQueryResult {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  views: number;
  likeCount: number;
  isNotice: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  userId: number;
  user: { id: number; nickname: string; profileImageUrl: string | null };
  _count: { comments: number };
}

export class PostRepositoryImpl implements PostRepository {
  private readonly listSelect = {
    id: true,
    title: true,
    thumbnailUrl: true,
    views: true,
    likeCount: true,
    isNotice: true,
    isAnonymous: true,
    createdAt: true,
    userId: true,
    user: {
      select: {
        id: true,
        nickname: true,
        profileImageUrl: true,
      },
    },
    _count: {
      select: { comments: { where: { deletedAt: null } } },
    },
  };

  async findById(id: number): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
    });
    return post as Post | null;
  }

  async findDetail(id: number, userId?: number): Promise<PostDetail | null> {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImageUrl: true,
            createdAt: true,
          },
        },
        category: true,
        subCategory: true,
        _count: {
          select: { comments: { where: { deletedAt: null } } },
        },
      },
    });

    if (!post) return null;

    let myReaction = null;
    if (userId) {
      const [like, dislike] = await Promise.all([
        prisma.likeToPost.findUnique({
          where: { userId_postId: { userId, postId: id } },
        }),
        prisma.dislikeToPost.findUnique({
          where: { userId_postId: { userId, postId: id } },
        }),
      ]);
      myReaction = { liked: !!like, disliked: !!dislike };
    }

    let anonymousId: string | null = null;
    if (post.isAnonymous) {
      const anon = await prisma.anonymousUserInPost.findUnique({
        where: { userId_postId: { userId: post.userId, postId: id } },
      });
      anonymousId = anon?.anonymousId ?? null;
    }

    return {
      ...post,
      author: post.isAnonymous ? null : post.user,
      anonymousId,
      commentCount: post._count.comments,
      myReaction,
    } as PostDetail;
  }

  async findList(params: PostListParams): Promise<PostListItem[]> {
    const { categoryId, subCategoryId, page, limit } = params;

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        isNotice: false,
        ...(categoryId && { categoryId }),
        ...(subCategoryId && { subCategoryId }),
      },
      select: this.listSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map((post: PostListQueryResult) => this.toListItem(post));
  }

  async findNoticeList(categoryId: number): Promise<PostListItem[]> {
    const posts = await prisma.post.findMany({
      where: {
        categoryId,
        isNotice: true,
        deletedAt: null,
      },
      select: this.listSelect,
      orderBy: { createdAt: "desc" },
    });

    return posts.map((post: PostListQueryResult) => this.toListItem(post));
  }

  async findPopularList(page: number, limit: number): Promise<PostListItem[]> {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const posts = await prisma.post.findMany({
      where: {
        deletedAt: null,
        createdAt: { gte: oneMonthAgo },
      },
      select: this.listSelect,
      orderBy: { likeCount: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map((post: PostListQueryResult) => this.toListItem(post));
  }

  async findRecentByCategories(
    categoryIds: number[],
    limit: number
  ): Promise<Map<number, PostListItem[]>> {
    const result = new Map<number, PostListItem[]>();

    await Promise.all(
      categoryIds.map(async (categoryId) => {
        const posts = await prisma.post.findMany({
          where: {
            categoryId,
            deletedAt: null,
          },
          select: this.listSelect,
          orderBy: { createdAt: "desc" },
          take: limit,
        });
        result.set(categoryId, posts.map((post: PostListQueryResult) => this.toListItem(post)));
      })
    );

    return result;
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<PostListItem[]> {
    const posts = await prisma.post.findMany({
      where: { userId, deletedAt: null },
      select: this.listSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return posts.map((post: PostListQueryResult) => this.toListItem(post));
  }

  async count(params: { categoryId?: number; subCategoryId?: number }): Promise<number> {
    return prisma.post.count({
      where: {
        deletedAt: null,
        isNotice: false,
        ...(params.categoryId && { categoryId: params.categoryId }),
        ...(params.subCategoryId && { subCategoryId: params.subCategoryId }),
      },
    });
  }

  async countByUserId(userId: number): Promise<number> {
    return prisma.post.count({
      where: { userId, deletedAt: null },
    });
  }

  async create(userId: number, data: CreatePostInput, isAnonymous: boolean): Promise<Post> {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        images: data.images,
        thumbnailUrl: data.images[0] ?? null,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        userId,
        isNotice: data.isNotice ?? false,
        isAnonymous,
      },
    });
    return post as Post;
  }

  async update(id: number, data: UpdatePostInput): Promise<Post> {
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        thumbnailUrl: data.images ? data.images[0] ?? null : undefined,
        updatedAt: new Date(),
      },
    });
    return post as Post;
  }

  async softDelete(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async incrementViews(id: number): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  private toListItem(post: PostListQueryResult): PostListItem {
    return {
      id: post.id,
      title: post.title,
      thumbnailUrl: post.thumbnailUrl,
      views: post.views,
      likeCount: post.likeCount,
      commentCount: post._count.comments,
      isNotice: post.isNotice,
      isAnonymous: post.isAnonymous,
      createdAt: post.createdAt,
      author: post.isAnonymous
        ? null
        : {
            nickname: post.user.nickname,
            profileImageUrl: post.user.profileImageUrl,
          },
      anonymousId: null,
    };
  }
}

import prisma from '@/server/modules/prisma';
import s3 from '@/server/modules/s3';
import {PostRepository} from '@/server/repositories/post.repository';

export class PostService {
  constructor(
    private readonly postRepository: PostRepository = new PostRepository(),
    private readonly prismaHelper = prisma,
    private readonly s3Helper = s3,
  ) {}

  /**
   * 게시글 목록 조회
   */
  async getPostList(
    page: number,
    limit: number,
    categoryId?: number,
    subCategoryId?: number,
  ) {
    const list = await this.postRepository.getList(
      page,
      limit,
      categoryId,
      subCategoryId,
    );
    const total = await this.postRepository.getCount(categoryId, subCategoryId);
    const lastPage = Math.ceil(total / limit);

    return {
      page,
      lastPage,
      total,
      list,
    };
  }

  /**
   * 인기 게시글 목록 조회
   */
  async getPopularPostList({page, limit}: {page: number; limit: number}) {
    const posts = await this.postRepository.getPopularList(page, limit);

    return {
      page: page,
      lastPage: 1,
      total: posts.length,
      list: posts,
    };
  }

  /**
   * 공지사항 목록 조회
   */
  async getNoticePostList({categoryId}: {categoryId: number}) {
    const list = await this.postRepository.getNoticeList(categoryId);

    return {list};
  }

  /**
   * 게시글 상세 조회
   */
  async getPostDetail(id: number) {
    const post = await this.postRepository.getDetail(id);
    return post;
  }

  /**
   * 게시글 생성
   */
  async create(
    user: {
      id: number;
      role: 'SUPER_ADMIN' | 'BOARD_ADMIN' | 'USER';
    },
    createPostReqDto: {
      images: string[];
      title: string;
      categoryId: number;
      subCategoryId: number;
      content: string;
      isNotice: boolean;
    },
  ) {
    const {images, title, categoryId, subCategoryId, content, isNotice} =
      createPostReqDto;

    if (
      isNotice &&
      user.role !== 'SUPER_ADMIN' &&
      user.role !== 'BOARD_ADMIN'
    ) {
      throw new Error('404 Not Found');
    }

    const post = await this.postRepository.create(
      user.id,
      title,
      content,
      isNotice,
      categoryId,
      subCategoryId,
    );
    // 이미지 파일 이동
    const movedImageUrls = await Promise.all(
      images.map((imageUrl, index) =>
        this.s3Helper.moveObject(imageUrl, `post/${post.id}`, index.toString()),
      ),
    );

    // 게시글에 이미지 URL 변경
    let updatedContent = content;
    images.forEach((imageUrl, index) => {
      updatedContent = updatedContent.replace(imageUrl, movedImageUrls[index]);
    });

    const newPost = await this.postRepository.update(post.id, {
      content: updatedContent,
      images: movedImageUrls,
      thumbnailUrl: movedImageUrls.length > 0 ? movedImageUrls[0] : undefined,
    });
    return {id: newPost.id};
  }

  /**
   * 게시글 좋아요
   */
  async likePost(postId: number, userId: number) {
    const like = await this.prismaHelper.likeToPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // 이미 좋아요를 누른 경우 -> 좋아요 취소
    if (like) {
      await this.prismaHelper.likeToPost.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      await this.prismaHelper.likeToPost.create({
        data: {
          postId,
          userId,
        },
      });
    }
  }

  /**
   * 게시글 싫어요
   */
  async dislikePost(postId: number, userId: number) {
    const dislikes = await this.prismaHelper.dislikeToPost.findUnique({
      where: {userId_postId: {userId, postId}},
    });
    if (dislikes) {
      await this.prismaHelper.dislikeToPost.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      await this.prismaHelper.dislikeToPost.create({
        data: {
          postId,
          userId,
        },
      });
    }
  }

  /**
   * 조회수 증가
   */
  async increaseViewCount(postId: number) {
    await this.prismaHelper.post.update({
      where: {id: postId},
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  /**
   * 게시글 삭제
   */
  delete(postId: number, userId: number) {
    this.postRepository.delete(postId, userId);
  }
}

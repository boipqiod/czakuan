import {getUniqueString} from '@/lib/random';
import {NotFoundError} from '@/server/Error';
import prisma from '@/server/modules/prisma';
import s3 from '@/server/modules/s3';
import {PostRepository} from '@/server/repositories/post.repository';
import {User} from '@/types/user';

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
    const total = await this.postRepository.getPopularCount();
    const lastPage = Math.ceil(total / limit);

    return {
      page: page,
      lastPage: lastPage,
      total,
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
    if (!post) throw NotFoundError();

    return post;
  }

  /**
   * 게시글 생성
   */
  async create(
    user: User,
    title: string,
    content: string,
    images: string[],
    categoryId: number,
    subCategoryId?: number,
    isNotice?: boolean,
  ) {
    const newPost = await this.postRepository.create(
      user.id,
      title,
      content,
      categoryId,
      subCategoryId,
      isNotice,
    );
    // 이미지 파일 이동
    const movedImageUrls = await Promise.all(
      images.map((imageUrl, index) =>
        this.s3Helper.moveObject(
          imageUrl,
          `post/${getUniqueString()}`,
          index.toString(),
        ),
      ),
    );

    // 게시글에 이미지 URL 변경
    let updatedContent = content;
    images.forEach((imageUrl, index) => {
      updatedContent = updatedContent.replace(imageUrl, movedImageUrls[index]);
    });

    const updatedPost = await this.postRepository.update(newPost.id, {
      content: updatedContent,
      images: movedImageUrls,
      thumbnailUrl: movedImageUrls.length > 0 ? movedImageUrls[0] : undefined,
    });
    return {id: updatedPost.id};
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
  async delete(postId: number, userId: number) {
    await this.postRepository.delete(postId, userId);
  }

  report = async (postId: number, userId: number, reason: string) => {
    await this.postRepository.report(postId, userId, reason);
  };

  /**
   * [어드민] 게시글 신고 목록 조회
   */
  async getReportedList(page: number, limit: number) {
    const list = await this.postRepository.reportList(page, limit);
    const total = await this.postRepository.reportCount();
    const lastPage = Math.ceil(total / limit);

    return {
      page,
      lastPage,
      total,
      list,
    };
  }
}

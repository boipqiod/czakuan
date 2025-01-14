import {getUniqueString} from '@/lib/random';
import {NotFoundError} from '@/server/Error';
import prisma from '@/server/modules/prisma';
import s3 from '@/server/modules/s3';
import {PostRepository} from '@/server/repositories/post.repository';
import {ListType, PostDetailType, PostListType} from '@/types/post';
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
  ): Promise<ListType<PostListType>> {
    const category = await this.prismaHelper.category.findUnique({
      where: {id: categoryId},
    });
    const isAnonymous = category?.isAnonymous ?? false;
    const list = await this.postRepository.getList(
      page,
      limit,
      categoryId,
      subCategoryId,
    );
    const total = await this.postRepository.getCount(categoryId, subCategoryId);
    const lastPage = Math.ceil(total / limit);

    if (isAnonymous) {
      const anonymMap = new Map<string, string>();

      // 익명 유저 레코드 일괄 조회
      const anonymUsers = await this.prismaHelper.anonymousUserInPost.findMany({
        where: {postId: {in: list.map(post => post.id)}},
      });

      // (postId, userId)로 맵핑
      anonymUsers.forEach(user => {
        const key = `${user.postId}-${user.userId}`;
        anonymMap.set(key, user.anonymId);
      });

      // 이제 게시글 리스트 순회
      const anonymList = list.map(post => {
        const key = `${post.id}-${post.author.id}`;
        const anonymId = anonymMap.get(key);
        if (anonymId) {
          post.author = {
            id: 0,
            nickName: anonymId,
            role: 'USER',
            profileImageUrl: null,
          };

          delete (post as any).isAnonymous;
          delete (post as any).AnonymousUserInPost;

          return post;
        } else {
          return post;
        }
      });

      return {
        page,
        lastPage,
        total,
        list: anonymList,
      };
    }

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
  async getPopularPostList({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<ListType<PostListType>> {
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
  async getNoticePostList({
    categoryId,
  }: {
    categoryId: number;
  }): Promise<{list: PostListType[]}> {
    const list = await this.postRepository.getNoticeList(categoryId);
    return {list};
  }

  /**
   * 게시글 상세 조회
   */
  async getPostDetail(id: number): Promise<PostDetailType> {
    const post = await this.postRepository.getDetail(id);
    if (!post) throw NotFoundError();

    if (post.isAnonymous) {
      const anonymousUser =
        await this.prismaHelper.anonymousUserInPost.findFirst({
          where: {postId: id},
        });
      if (!anonymousUser) {
        throw NotFoundError('익명 사용자를 찾을 수 없습니다.');
      }

      post.author = {
        id: 0,
        nickName: anonymousUser.anonymId,
        role: 'USER',
        profileImageUrl: null,
      };

      delete (post as any).isAnonymous;
      delete (post as any).AnonymousUserInPost;
    }

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
    const category = await this.prismaHelper.category.findUnique({
      where: {id: categoryId},
    });
    if (!category) {
      throw NotFoundError('카테고리를 찾을 수 없습니다.');
    }

    const newPost = await this.postRepository.create(
      user.id,
      title,
      content,
      categoryId,
      category.isAnonymous,
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

    if (category.isAnonymous && isNotice !== true) {
      await this.prismaHelper.anonymousUserInPost.create({
        data: {
          userId: user.id,
          postId: updatedPost.id,
          anonymId: getUniqueString(),
        },
      });
    }
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

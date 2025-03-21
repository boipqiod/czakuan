import {getUniqueString} from '@/lib/random';
import {userInfo} from '@/server/actions/auth.actions';
import {NotFoundError} from '@/server/Error';
import prisma from '@/server/modules/prisma';
import {CommentRepository} from '@/server/repositories/comment.repository';
import {PostRepository} from '@/server/repositories/post.repository';

export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository = new CommentRepository(),
    private readonly postRepository: PostRepository = new PostRepository(),
  ) {}

  async getCommentList(
    postId: number,
    limit: number,
    page?: number,
    userId?: number,
  ) {
    const post = await prisma.post.findUnique({
      where: {id: postId},
      select: {
        isAnonymous: true,
        AnonymousUserInPost: true,
        category: {
          select: {
            isPrivateComment: true,
          },
        },
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!post) {
      throw NotFoundError('게시글을 찾을 수 없습니다.');
    }

    const _page =
      page ?? (await this.commentRepository.getLastPage(postId, limit));

    const [list, total] = await Promise.all([
      this.commentRepository.getList(postId, limit, _page),
      this.commentRepository.getCount(postId),
    ]);

    const lastPage = Math.ceil(total / limit);

    if (post.isAnonymous) {
      // 1) userId -> anonymId 매핑 생성 (한 번의 루프)
      const anonymMap = new Map<number, string>();
      post.AnonymousUserInPost.forEach(user => {
        anonymMap.set(user.userId, user.anonymId);
      });

      // 2) 댓글 배열 순회 (한 번의 루프)
      list.forEach(comment => {
        const anonymId = anonymMap.get(comment.author.id);
        const parentAnonymId = anonymMap.get(comment.parent?.author.id ?? -1);
        if (anonymId) {
          // 익명으로 교체
          comment.author = {
            id: 0,
            nickName: anonymId,
            profileImageUrl: null,
            role: 'USER',
          };
        } else {
          comment.author = {
            id: 0,
            nickName: '익명',
            profileImageUrl: null,
            role: 'USER',
          };
        }
        if (parentAnonymId && comment.parent) {
          // 부모 댓글의 익명 ID로 교체
          comment.parent.author = {
            id: 0,
            nickName: parentAnonymId,
          };
        }
      });
    }

    if (post.category.isPrivateComment) {
      const user = await userInfo();

      list.forEach(comment => {
        if (
          comment.author.id !== post.author.id &&
          comment.author.id !== user.data?.id &&
          user.data?.role !== 'SUPER_ADMIN'
        ) {
          comment.content = '비공개 댓글입니다.';
        }
      });
    }

    return {
      page: _page,
      lastPage,
      total,
      list,
    };
  }

  async createComment(
    postId: number,
    userId: number,
    content: string,
    parentId?: number,
    rootId?: number,
  ) {
    const post = await this.postRepository.getDetail(postId);
    if (!post) {
      throw NotFoundError('게시글을 찾을 수 없습니다.');
    }

    const comment = await this.commentRepository.create(
      postId,
      userId,
      content,
      parentId,
      rootId,
    );

    // 부모 댓글이 없는 경우 부모 댓글로 자신의 id를 설정
    if (!rootId) {
      await this.commentRepository.updateRootId(comment.id, comment.id);
    }

    if (post.isAnonymous) {
      let anonymRecord = await prisma.anonymousUserInPost.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      // 아직 익명 ID가 없다면 생성
      if (!anonymRecord) {
        anonymRecord = await prisma.anonymousUserInPost.create({
          data: {
            userId,
            postId,
            anonymId: getUniqueString(),
          },
        });
      }
      if (parentId && comment.parent) {
        const parentAnonymRecord = await prisma.anonymousUserInPost.findUnique({
          where: {
            userId_postId: {
              userId: comment.parent?.author.id ?? -1,
              postId,
            },
          },
        });
        comment.parent.author = {
          id: 0,
          nickName: parentAnonymRecord?.anonymId ?? '익명',
        };
      }

      comment.author = {
        id: 0,
        nickName: anonymRecord.anonymId,
        profileImageUrl: null,
        role: 'USER',
      };
    }

    return comment;
  }

  async deleteComment(commentId: number, userId: number) {
    return this.commentRepository.delete(commentId, userId);
  }

  async likeComment(commentId: number, userId: number) {
    const like = await this.commentRepository.getLike(commentId, userId);

    if (like) {
      this.commentRepository.deleteLike(commentId, userId);
    } else {
      this.commentRepository.createLike(commentId, userId);
    }

    const _like = await this.commentRepository.getLike(commentId, userId);
    console.log(_like);
  }

  async dislikeComment(commentId: number, userId: number) {
    const dislike = await this.commentRepository.getDislike(commentId, userId);

    if (dislike) {
      this.commentRepository.deleteDislike(commentId, userId);
    } else {
      this.commentRepository.createDislike(commentId, userId);
    }
  }

  async reportComment(commentId: number, userId: number, reason: string) {
    return this.commentRepository.report(commentId, userId, reason);
  }

  async getReportedList(page: number, limit: number) {
    const list = await this.commentRepository.reportList(page, limit);
    const total = await this.commentRepository.reportCount();
    const lastPage = Math.ceil(total / limit);

    return {
      page,
      lastPage,
      total,
      list,
    };
  }
}

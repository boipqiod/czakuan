import {CommentRepository} from '@/server/repositories/comment.repository';

export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository = new CommentRepository(),
  ) {}

  async getCommentList(postId: number, limit: number, page?: number) {
    const _page =
      page ?? (await this.commentRepository.getLastPage(postId, limit));

    const [list, total] = await Promise.all([
      this.commentRepository.getList(postId, limit, _page),
      this.commentRepository.getCount(postId),
    ]);

    const lastPage = Math.ceil(total / limit);

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

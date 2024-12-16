'use server';

import {CommentRepository} from '@/server/repositories/comment.repository';
import {PostRepository} from '@/server/repositories/post.repository';
import {PostService} from '@/server/service/post.service';

type getPostListParams = {
  page?: number;
  limit?: number;
  categoryId?: number;
  subCategoryId?: number;
};

export const getPostList = async ({
  page = 1,
  limit = 10,
  categoryId,
  subCategoryId,
}: getPostListParams | undefined = {}) => {
  const service = new PostService();

  if (categoryId || subCategoryId) {
    return service.getPostList(page, limit, categoryId, subCategoryId);
  } else {
    return service.getPopularPostList({page, limit});
  }
};

export const getPostDetail = async (id: number) => {
  const repo = new PostRepository();
  const post = await repo.getDetail(id);

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
};

export const getCommentList = async (postId: number, page: number) => {
  const repo = new CommentRepository();
  const [comments, count] = await Promise.all([
    repo.getList(postId, 30, page),
    repo.getCount(postId),
  ]);
  const lastPage = Math.ceil(count / 10);

  return {
    page,
    lastPage,
    total: count,
    list: comments,
  };
};

'use server';

import {PostService} from '@/server/service/post.service';
import {unstable_cache} from 'next/cache';

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
  console.log('getPostList');

  const service = new PostService();

  if (categoryId || subCategoryId) {
    return service.getPostList(page, limit, categoryId, subCategoryId);
  } else {
    return service.getPopularPostList({page, limit});
  }
};

export const getPostDetail = async (id: number) => {
  const service = new PostService();
  const post = await service.getPostDetail(id);

  if (!post) {
    throw new Error('Post not found');
  }

  return post;
};

export const getNoticeList = unstable_cache(
  async (categoryId?: number) => {
    const service = new PostService();
    return await service.getNoticePostList({categoryId: categoryId ?? 1});
  },
  ['getNoticeList'],
  {revalidate: 1000 * 60 * 60},
);

export const likePost = async (postId: number, userId: number) => {
  const service = new PostService();
  await service.likePost(postId, userId);
  return null;
};

export const dislikePost = async (postId: number, userId: number) => {
  const service = new PostService();
  await service.dislikePost(postId, userId);
  return null;
};

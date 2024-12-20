'use server';

import s3 from '@/server/modules/s3';
import {PostService} from '@/server/service/post.service';
import {TokenService} from '@/server/service/token.service';
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

export const uploadTempPostImage = async (file: File) => {
  const url = await s3.uploadTempImage('post', file);
  return {url};
};

export const createPost = async (
  title: string,
  content: string,
  images: string[],
  categoryId: number,
  subCategoryId?: number,
  isNotice?: boolean,
) => {
  const tokenService = new TokenService();
  const service = new PostService();

  const user = await tokenService.verifyCookieToken();

  if (!user) {
    throw new Error('User not found'); //TODO: Error handling
  }

  return await service.create(
    {
      id: user.id,
      role: user.role,
    },
    {
      title,
      content,
      categoryId,
      images,
      subCategoryId,
      isNotice: isNotice ?? false,
    },
  );
};

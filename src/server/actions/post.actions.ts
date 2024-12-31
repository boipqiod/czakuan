'use server';

import {serverAction} from '@/server/actions/action';
import {UnauthorizedError} from '@/server/Error';
import {verifyUser} from '@/server/modules/auth';
import s3 from '@/server/modules/s3';
import {PostService} from '@/server/service/post.service';

type getPostListParams = {
  page?: number;
  limit?: number;
  categoryId?: number;
  subCategoryId?: number;
};

//###################
//#### Post List ####
//###################

export const getPostList = async ({
  page = 1,
  limit = 10,
  categoryId,
  subCategoryId,
}: getPostListParams | undefined = {}) =>
  serverAction(async () => {
    const service = new PostService();
    if (categoryId || subCategoryId) {
      return service.getPostList(page, limit, categoryId, subCategoryId);
    } else {
      return service.getPopularPostList({page, limit});
    }
  });

//###################
//### Post Detail ###
//###################

export const getPostDetail = async (id: number) =>
  serverAction(() => {
    const service = new PostService();
    return service.getPostDetail(id);
  });

export const getNoticeList = async (categoryId?: number) =>
  serverAction(() => {
    const service = new PostService();
    return service.getNoticePostList({categoryId: categoryId ?? 1});
  });

export const likePost = async (postId: number, userId: number) =>
  serverAction(async () => {
    const service = new PostService();
    await service.likePost(postId, userId);
    return null;
  });

export const dislikePost = async (postId: number, userId: number) =>
  serverAction(async () => {
    const service = new PostService();
    await service.dislikePost(postId, userId);
    return null;
  });

export const reportPost = async (
  postId: number,
  userId: number,
  reason: string,
) =>
  serverAction(async () => {
    const service = new PostService();
    await service.report(postId, userId, reason);
    return null;
  });

export const deletePost = async (postId: number, userId: number) =>
  serverAction(async () => {
    const service = new PostService();
    await service.delete(postId, userId);
    return null;
  });

export const increaseViewCountPost = async (postId: number) =>
  serverAction(async () => {
    await new PostService().increaseViewCount(postId);
    return null;
  });

//###################
//### Create Post ###
//###################
export const uploadTempPostImage = async (file: File) =>
  serverAction(async () => {
    const url = await s3.uploadTempImage('post', file);
    return {url};
  });

export const createPost = async (
  title: string,
  content: string,
  images: string[],
  categoryId: number,
  subCategoryId?: number,
  isNotice?: boolean,
) =>
  serverAction(async () => {
    const user = await verifyUser();

    if (!user) throw UnauthorizedError();

    const service = new PostService();
    return service.create(
      user,
      title,
      content,
      images,
      categoryId,
      subCategoryId,
      isNotice,
    );
  });

//###################
//### Admin Post ###
//###################

export const getReportedPostList = async (page: number) =>
  serverAction(async () => {
    // try {
    //   await verifyAdmin();
    // } catch (error) {
    //   console.log('### getReportedPostList error', error);
    // }

    const service = new PostService();
    return service.getReportedList(page ?? 1, 30);
  });

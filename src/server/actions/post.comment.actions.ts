'use server';
import {serverAction} from '@/server/actions/action';
import {CommentService} from '@/server/service/comment.service';

export const likeComment = async (commentId: number, userId: number) =>
  serverAction(async () => {
    const service = new CommentService();
    await service.likeComment(commentId, userId);
    return null;
  });

export const dislikeComment = async (commentId: number, userId: number) =>
  serverAction(async () => {
    const service = new CommentService();
    await service.dislikeComment(commentId, userId);
    return null;
  });

export const deleteComment = async (commentId: number, userId: number) =>
  serverAction(async () => {
    const service = new CommentService();
    await service.deleteComment(commentId, userId);
    return null;
  });

export const createComment = async (
  postId: number,
  userId: number,
  content: string,
  parentId?: number,
  rootId?: number,
) =>
  serverAction(async () => {
    const service = new CommentService();
    return service.createComment(postId, userId, content, parentId, rootId);
  });

export const getCommentList = async (postId: number, page?: number) =>
  serverAction(async () => {
    const service = new CommentService();
    const comments = await service.getCommentList(postId, 10, page);

    return comments;
  });

export const reportComment = async (commentId: number, userId: number, reason: string) =>
  serverAction(async () => {
    const service = new CommentService();
    return service.reportComment(commentId, userId, reason);
  });

export const getReportedCommentList = async (page: number) => 
  serverAction(async () => {
    const service = new CommentService();
    return service.getReportedList(page, 30);
});

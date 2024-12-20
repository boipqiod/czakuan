'use server';
import {CommentService} from '@/server/service/comment.service';

export const likeComment = async (commentId: number, userId: number) => {
  const service = new CommentService();
  await service.likeComment(commentId, userId);
  return null;
};
export const dislikeComment = async (commentId: number, userId: number) => {
  const service = new CommentService();
  await service.dislikeComment(commentId, userId);
  return null;
};

export const deleteComment = async (commentId: number, userId: number) => {
  const service = new CommentService();
  await service.deleteComment(commentId, userId);
  return null;
};

export const createComment = async (
  postId: number,
  userId: number,
  content: string,
  parentId?: number,
  rootId?: number,
) => {
  console.log('createComment', {postId, userId, content, parentId, rootId});

  const service = new CommentService();
  return service.createComment(postId, userId, content, parentId, rootId);
};

export const getCommentList = async (postId: number, page?: number) => {
  console.log('getCommentList', {postId, page});

  const service = new CommentService();
  const comments = await service.getCommentList(postId, 10, page);

  return comments;
};

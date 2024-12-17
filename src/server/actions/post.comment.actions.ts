'use server';
import {CommentService} from '@/server/service/comment.service';

export const likeComment = async (commentId: number, userId: number) => {
  const service = new CommentService();
  return service.likeComment(commentId, userId);
};
export const dislikeComment = async (commentId: number, userId: number) => {
  const service = new CommentService();
  return service.dislikeComment(commentId, userId);
};

export const deleteComment = async (commentId: number, userId: number) => {
  const service = new CommentService();
  return service.deleteComment(commentId, userId);
};

export const createComment = async (
  postId: number,
  userId: number,
  content: string,
  parentId?: number,
  rootId?: number,
) => {
  const service = new CommentService();
  return service.createComment(postId, userId, content, parentId, rootId);
};

export const getCommentList = async (postId: number, page: number) => {
  const service = new CommentService();
  const comments = await service.getCommentList(postId, 30);

  return comments;
};

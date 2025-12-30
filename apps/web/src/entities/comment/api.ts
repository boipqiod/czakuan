import { apiClient, type ApiResponse } from "@/shared/api";
import type { Comment, CommentListResult, CreateCommentInput } from "./types";

export const commentApi = {
  getList: async (params: { postId: number; page?: number; limit?: number }): Promise<CommentListResult> => {
    const { postId, page = 1, limit = 20 } = params;
    const response = await apiClient.get<ApiResponse<CommentListResult>>(
      `/comments/post/${postId}?page=${page}&limit=${limit}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "댓글 목록 조회 실패");
    }
    return response.data.data;
  },

  create: async (data: CreateCommentInput): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>("/comments", data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "댓글 작성 실패");
    }
    return response.data.data;
  },

  delete: async (commentId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/comments/${commentId}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "댓글 삭제 실패");
    }
  },

  toggleLike: async (commentId: number): Promise<{ liked: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ liked: boolean }>>(
      `/comments/${commentId}/like`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "좋아요 실패");
    }
    return response.data.data;
  },

  toggleDislike: async (commentId: number): Promise<{ disliked: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ disliked: boolean }>>(
      `/comments/${commentId}/dislike`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "싫어요 실패");
    }
    return response.data.data;
  },

  report: async (commentId: number, reason: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<null>>(`/comments/${commentId}/report`, { reason });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "신고 실패");
    }
  },
};

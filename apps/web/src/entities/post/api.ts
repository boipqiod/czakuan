import { apiClient, type ApiResponse } from "@/shared/api";
import type {
  PostDetail,
  PostListItem,
  PostListResult,
  CategoryGroup,
  Post,
  CreatePostInput,
  UpdatePostInput,
} from "./types";

export const postApi = {
  getList: async (params: { categoryId?: number; page?: number; limit?: number }): Promise<PostListResult> => {
    const { categoryId, page = 1, limit = 20 } = params;
    const url = categoryId
      ? `/posts/category/${categoryId}?page=${page}&limit=${limit}`
      : `/posts?page=${page}&limit=${limit}`;

    const response = await apiClient.get<ApiResponse<PostListResult>>(url);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "게시글 목록 조회 실패");
    }
    return response.data.data;
  },

  getPopular: async (params: { page?: number; limit?: number }): Promise<PostListItem[]> => {
    const { page = 1, limit = 20 } = params;
    const response = await apiClient.get<ApiResponse<PostListItem[]>>(
      `/posts/popular?page=${page}&limit=${limit}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "인기 게시글 조회 실패");
    }
    return response.data.data;
  },

  getDetail: async (postId: number): Promise<PostDetail> => {
    const response = await apiClient.get<ApiResponse<PostDetail>>(`/posts/${postId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "게시글 조회 실패");
    }
    return response.data.data;
  },

  create: async (data: CreatePostInput): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>("/posts", data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "게시글 작성 실패");
    }
    return response.data.data;
  },

  update: async (postId: number, data: UpdatePostInput): Promise<Post> => {
    const response = await apiClient.put<ApiResponse<Post>>(`/posts/${postId}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "게시글 수정 실패");
    }
    return response.data.data;
  },

  delete: async (postId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/posts/${postId}`);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "게시글 삭제 실패");
    }
  },

  toggleLike: async (postId: number): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiClient.post<ApiResponse<{ liked: boolean; likeCount: number }>>(
      `/posts/${postId}/like`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "좋아요 실패");
    }
    return response.data.data;
  },

  toggleDislike: async (postId: number): Promise<{ disliked: boolean; dislikeCount: number }> => {
    const response = await apiClient.post<ApiResponse<{ disliked: boolean; dislikeCount: number }>>(
      `/posts/${postId}/dislike`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "싫어요 실패");
    }
    return response.data.data;
  },

  report: async (postId: number, reason: string): Promise<void> => {
    const response = await apiClient.post<ApiResponse<null>>(`/posts/${postId}/report`, { reason });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "신고 실패");
    }
  },

  getCategories: async (): Promise<CategoryGroup[]> => {
    const response = await apiClient.get<ApiResponse<CategoryGroup[]>>("/categories");
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "카테고리 조회 실패");
    }
    return response.data.data;
  },
};

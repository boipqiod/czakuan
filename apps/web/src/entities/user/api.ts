import { apiClient, type ApiResponse } from "@/shared/api";
import type { User, UserProfile } from "./types";

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "프로필 조회 실패");
    }
    return response.data.data;
  },

  updateProfile: async (data: { nickname?: string; profileImageUrl?: string }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>("/users/me", data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "프로필 수정 실패");
    }
    return response.data.data;
  },

  checkNickname: async (nickname: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      `/users/check-nickname?nickname=${encodeURIComponent(nickname)}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "닉네임 확인 실패");
    }
    return response.data.data.available;
  },
};

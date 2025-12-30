import { apiClient, type ApiResponse } from "@/shared/api";
import type { User } from "@/entities/user";

export interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export const authApi = {
  getKakaoAuthUrl: async (): Promise<string> => {
    const response = await apiClient.get<ApiResponse<{ url: string }>>("/auth/kakao/url");
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "카카오 인증 URL 조회 실패");
    }
    return response.data.data.url;
  },

  kakaoLogin: async (code: string, nickname?: string): Promise<LoginResult> => {
    const response = await apiClient.post<ApiResponse<LoginResult>>("/auth/kakao", {
      code,
      nickname,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "카카오 로그인 실패");
    }
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || "토큰 갱신 실패");
    }
    return response.data.data;
  },
};

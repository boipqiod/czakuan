import axios, { type AxiosError, type AxiosResponse } from "axios";
import { env } from "../config";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${env.apiBaseUrl}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.success && response.data.data) {
            localStorage.setItem("accessToken", response.data.data.accessToken);
            localStorage.setItem("refreshToken", response.data.data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

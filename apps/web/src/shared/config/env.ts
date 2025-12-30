export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  kakaoClientId: import.meta.env.VITE_KAKAO_CLIENT_ID || "",
} as const;

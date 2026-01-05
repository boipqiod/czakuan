import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";

interface UseKakaoLoginResult {
  isLoading: boolean;
  error: string | null;
  handleCallback: (code: string, nickname?: string) => Promise<void>;
  redirectToKakao: () => Promise<void>;
  needsNickname: boolean;
  setNeedsNickname: (value: boolean) => void;
}

export function useKakaoLogin(): UseKakaoLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsNickname, setNeedsNickname] = useState(false);
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();

  const redirectToKakao = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await authApi.getKakaoAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "카카오 로그인 실패");
      setIsLoading(false);
    }
  }, []);

  const handleCallback = useCallback(async (code: string, nickname?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authApi.kakaoLogin(code, nickname);

      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);

      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인 실패";

      if (message.includes("닉네임")) {
        setNeedsNickname(true);
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setTokens, setUser]);

  return {
    isLoading,
    error,
    handleCallback,
    redirectToKakao,
    needsNickname,
    setNeedsNickname,
  };
}

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AuthService } from "@/application/auth/AuthService";

const authRoutes = new Hono();
const authService = new AuthService();

const kakaoLoginSchema = z.object({
  code: z.string().min(1, "인증 코드가 필요합니다."),
  nickname: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "리프레시 토큰이 필요합니다."),
});

// 카카오 인증 URL 조회
authRoutes.get("/kakao/url", (c) => {
  const url = authService.getKakaoAuthUrl();
  return c.json({ success: true, data: { url } });
});

// 카카오 로그인
authRoutes.post("/kakao", zValidator("json", kakaoLoginSchema), async (c) => {
  const { code, nickname } = c.req.valid("json");
  const result = await authService.kakaoLogin(code, nickname);

  return c.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      isNewUser: result.isNewUser,
    },
  });
});

// 토큰 갱신
authRoutes.post("/refresh", zValidator("json", refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid("json");
  const tokens = await authService.refreshToken(refreshToken);

  return c.json({
    success: true,
    data: tokens,
  });
});

export { authRoutes };

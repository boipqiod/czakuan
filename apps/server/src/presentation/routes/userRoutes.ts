import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserService } from "@/application/user/UserService";
import { authMiddleware } from "../middlewares/authMiddleware";

const userRoutes = new Hono();
const userService = new UserService();

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  profileImageUrl: z.string().url().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const checkNicknameSchema = z.object({
  nickname: z.string().min(2).max(20),
});

// 내 프로필 조회
userRoutes.get("/me", authMiddleware, async (c) => {
  const auth = c.get("auth");
  const profile = await userService.getProfile(auth.userId);

  return c.json({ success: true, data: profile });
});

// 프로필 수정
userRoutes.put(
  "/me",
  authMiddleware,
  zValidator("json", updateProfileSchema),
  async (c) => {
    const auth = c.get("auth");
    const data = c.req.valid("json");
    const user = await userService.updateProfile(auth.userId, data);

    return c.json({ success: true, data: user });
  }
);

// 내가 작성한 게시글 목록
userRoutes.get(
  "/me/posts",
  authMiddleware,
  zValidator("query", paginationSchema),
  async (c) => {
    const auth = c.get("auth");
    const { page, limit } = c.req.valid("query");
    const result = await userService.getMyPosts(auth.userId, page, limit);

    return c.json({ success: true, data: result });
  }
);

// 내가 작성한 댓글 목록
userRoutes.get(
  "/me/comments",
  authMiddleware,
  zValidator("query", paginationSchema),
  async (c) => {
    const auth = c.get("auth");
    const { page, limit } = c.req.valid("query");
    const result = await userService.getMyComments(auth.userId, page, limit);

    return c.json({ success: true, data: result });
  }
);

// 닉네임 중복 확인
userRoutes.get(
  "/check-nickname",
  authMiddleware,
  zValidator("query", checkNicknameSchema),
  async (c) => {
    const auth = c.get("auth");
    const { nickname } = c.req.valid("query");
    const available = await userService.checkNickname(nickname, auth.userId);

    return c.json({ success: true, data: { available } });
  }
);

export { userRoutes };

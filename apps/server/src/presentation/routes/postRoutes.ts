import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PostService } from "@/application/post/PostService";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware";

const postRoutes = new Hono();
const postService = new PostService();

const createPostSchema = z.object({
  categoryId: z.number().int().positive(),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  images: z.array(z.string().url()).default([]),
  subCategoryId: z.number().int().positive().optional(),
  isNotice: z.boolean().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(5000).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const reportSchema = z.object({
  reason: z.string().min(1).max(500),
});

// 게시글 목록 조회
postRoutes.get("/", zValidator("query", paginationSchema), async (c) => {
  const { page, limit } = c.req.valid("query");
  const result = await postService.getPostList({ page, limit });

  return c.json({ success: true, data: result });
});

// 카테고리별 게시글 목록
postRoutes.get(
  "/category/:categoryId",
  zValidator("query", paginationSchema),
  async (c) => {
    const categoryId = Number(c.req.param("categoryId"));
    const { page, limit } = c.req.valid("query");
    const result = await postService.getPostList({ categoryId, page, limit });

    return c.json({ success: true, data: result });
  }
);

// 인기 게시글 목록
postRoutes.get(
  "/popular",
  zValidator("query", paginationSchema),
  async (c) => {
    const { page, limit } = c.req.valid("query");
    const posts = await postService.getPopularPosts(page, limit);

    return c.json({ success: true, data: posts });
  }
);

// 게시글 상세 조회
postRoutes.get("/:id", optionalAuthMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  const post = await postService.getPostDetail(id, auth?.userId);

  // 조회수 증가
  await postService.incrementViews(id);

  return c.json({ success: true, data: post });
});

// 게시글 작성
postRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createPostSchema),
  async (c) => {
    const auth = c.get("auth");
    const data = c.req.valid("json");
    const post = await postService.createPost(auth.userId, auth.role, data);

    return c.json({ success: true, data: post }, 201);
  }
);

// 게시글 수정
postRoutes.put(
  "/:id",
  authMiddleware,
  zValidator("json", updatePostSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const auth = c.get("auth");
    const data = c.req.valid("json");
    const post = await postService.updatePost(id, auth.userId, auth.role, data);

    return c.json({ success: true, data: post });
  }
);

// 게시글 삭제
postRoutes.delete("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  await postService.deletePost(id, auth.userId, auth.role);

  return c.json({ success: true, data: null });
});

// 게시글 좋아요 토글
postRoutes.post("/:id/like", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  const result = await postService.toggleLike(id, auth.userId);

  return c.json({ success: true, data: result });
});

// 게시글 싫어요 토글
postRoutes.post("/:id/dislike", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  const result = await postService.toggleDislike(id, auth.userId);

  return c.json({ success: true, data: result });
});

// 게시글 신고
postRoutes.post(
  "/:id/report",
  authMiddleware,
  zValidator("json", reportSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const auth = c.get("auth");
    const { reason } = c.req.valid("json");
    await postService.reportPost(id, auth.userId, reason);

    return c.json({ success: true, data: null }, 202);
  }
);

export { postRoutes };

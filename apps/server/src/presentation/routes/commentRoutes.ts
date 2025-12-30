import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { CommentService } from "@/application/comment/CommentService";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware";

const commentRoutes = new Hono();
const commentService = new CommentService();

const createCommentSchema = z.object({
  postId: z.number().int().positive(),
  content: z.string().min(1).max(1000),
  parentId: z.number().int().positive().optional(),
  isPrivate: z.boolean().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const reportSchema = z.object({
  reason: z.string().min(1).max(500),
});

// 게시글의 댓글 목록 조회
commentRoutes.get(
  "/post/:postId",
  optionalAuthMiddleware,
  zValidator("query", paginationSchema),
  async (c) => {
    const postId = Number(c.req.param("postId"));
    const { page, limit } = c.req.valid("query");
    const auth = c.get("auth");
    const result = await commentService.getCommentList(
      postId,
      page,
      limit,
      auth?.userId,
      auth?.role
    );

    return c.json({ success: true, data: result });
  }
);

// 댓글 작성
commentRoutes.post(
  "/",
  authMiddleware,
  zValidator("json", createCommentSchema),
  async (c) => {
    const auth = c.get("auth");
    const { postId, content, parentId, isPrivate } = c.req.valid("json");
    const comment = await commentService.createComment(
      auth.userId,
      postId,
      content,
      parentId,
      isPrivate
    );

    return c.json({ success: true, data: comment }, 201);
  }
);

// 댓글 삭제
commentRoutes.delete("/:id", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  await commentService.deleteComment(id, auth.userId, auth.role);

  return c.json({ success: true, data: null });
});

// 댓글 좋아요 토글
commentRoutes.post("/:id/like", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  const result = await commentService.toggleLike(id, auth.userId);

  return c.json({ success: true, data: result });
});

// 댓글 싫어요 토글
commentRoutes.post("/:id/dislike", authMiddleware, async (c) => {
  const id = Number(c.req.param("id"));
  const auth = c.get("auth");
  const result = await commentService.toggleDislike(id, auth.userId);

  return c.json({ success: true, data: result });
});

// 댓글 신고
commentRoutes.post(
  "/:id/report",
  authMiddleware,
  zValidator("json", reportSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const auth = c.get("auth");
    const { reason } = c.req.valid("json");
    await commentService.reportComment(id, auth.userId, reason);

    return c.json({ success: true, data: null }, 201);
  }
);

export { commentRoutes };

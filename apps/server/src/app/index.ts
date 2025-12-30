import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorMiddleware } from "@/presentation/middlewares/errorMiddleware";
import {
  authRoutes,
  postRoutes,
  commentRoutes,
  categoryRoutes,
  userRoutes,
} from "@/presentation/routes";

const app = new Hono();

// Global middlewares
app.use("*", logger());
app.use("*", cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));
app.use("*", errorMiddleware);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// API routes
const api = new Hono();
api.route("/auth", authRoutes);
api.route("/posts", postRoutes);
api.route("/comments", commentRoutes);
api.route("/categories", categoryRoutes);
api.route("/users", userRoutes);

app.route("/api", api);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "요청한 리소스를 찾을 수 없습니다.",
      },
    },
    404
  );
});

const port = Number(process.env.SERVER_PORT) || 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;

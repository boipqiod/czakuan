import { Hono } from "hono";
import { CategoryService } from "@/application/category/CategoryService";

const categoryRoutes = new Hono();
const categoryService = new CategoryService();

// 전체 카테고리 목록 조회
categoryRoutes.get("/", async (c) => {
  const categories = await categoryService.getAllCategories();
  return c.json({ success: true, data: categories });
});

export { categoryRoutes };

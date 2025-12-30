import { prisma } from "@/infrastructure/db/prisma";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import type {
  Category,
  CategoryGroup,
  SubCategory,
  CategoryWithSubs,
  CategoryGroupWithCategories,
} from "@/domain/entities/Category";

export class CategoryRepositoryImpl implements CategoryRepository {
  async findGroupById(id: number): Promise<CategoryGroup | null> {
    return prisma.categoryGroup.findUnique({
      where: { id },
    });
  }

  async findCategoryById(id: number): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findSubCategoryById(id: number): Promise<SubCategory | null> {
    return prisma.subCategory.findUnique({
      where: { id },
    });
  }

  async findAllGroups(): Promise<CategoryGroupWithCategories[]> {
    const groups = await prisma.categoryGroup.findMany({
      where: { isUse: true },
      include: {
        categories: {
          where: { isUse: true },
          orderBy: { priority: "asc" },
          include: {
            subCategories: {
              where: { isUse: true },
              orderBy: { priority: "asc" },
            },
          },
        },
      },
      orderBy: { priority: "asc" },
    });

    return groups as CategoryGroupWithCategories[];
  }

  async findCategoriesByGroupId(groupId: number): Promise<CategoryWithSubs[]> {
    const categories = await prisma.category.findMany({
      where: { groupId, isUse: true },
      include: {
        subCategories: {
          where: { isUse: true },
          orderBy: { priority: "asc" },
        },
      },
      orderBy: { priority: "asc" },
    });

    return categories as CategoryWithSubs[];
  }

  async findSubCategoriesByCategoryId(categoryId: number): Promise<SubCategory[]> {
    return prisma.subCategory.findMany({
      where: { categoryId, isUse: true },
      orderBy: { priority: "asc" },
    });
  }

  async findActiveCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isUse: true },
      orderBy: { priority: "asc" },
    });
  }
}

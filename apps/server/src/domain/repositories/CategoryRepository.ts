import type {
  Category,
  CategoryGroup,
  SubCategory,
  CategoryWithSubs,
  CategoryGroupWithCategories,
} from "../entities/Category";

export interface CategoryRepository {
  findGroupById(id: number): Promise<CategoryGroup | null>;
  findCategoryById(id: number): Promise<Category | null>;
  findSubCategoryById(id: number): Promise<SubCategory | null>;
  findAllGroups(): Promise<CategoryGroupWithCategories[]>;
  findCategoriesByGroupId(groupId: number): Promise<CategoryWithSubs[]>;
  findSubCategoriesByCategoryId(categoryId: number): Promise<SubCategory[]>;
  findActiveCategories(): Promise<Category[]>;
}

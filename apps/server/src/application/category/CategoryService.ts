import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/CategoryRepositoryImpl";
import type { CategoryGroupWithCategories } from "@/domain/entities/Category";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepositoryImpl();
  }

  async getAllCategories(): Promise<CategoryGroupWithCategories[]> {
    return this.categoryRepository.findAllGroups();
  }
}

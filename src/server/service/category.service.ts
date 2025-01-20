import {CategoryRepository} from '@/server/repositories/category.repository';

export class CategoryService {
  constructor(private repository = new CategoryRepository()) {}

  async getCategoriesOnlyUse() {
    const categoryGroups = await this.repository.getCategoriesOnlyUse();
    return {categoryGroups};
  }
}

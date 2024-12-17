'use server';
import {CategoryService} from '@/server/service/category.service';

export const getCategorise = async () => {
  const service = new CategoryService();
  const categories = await service.getCategoriesOnlyUse();

  return categories;
};

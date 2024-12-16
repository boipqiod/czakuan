'use server';
import {serverAction} from '@/lib/actions';
import {CategoryService} from '@/server/service/category.service';

export const getCategorise = serverAction(async () => {
  const service = new CategoryService();
  const categories = await service.getCategoriesOnlyUse();

  return categories;
});

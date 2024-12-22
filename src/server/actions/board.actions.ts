'use server';
import {serverAction} from '@/server/actions/action';
import {CategoryService} from '@/server/service/category.service';

export const getCategorise = async () =>
  serverAction(async () => {
    const service = new CategoryService();
    const categories = await service.getCategoriesOnlyUse();

    return categories;
  });

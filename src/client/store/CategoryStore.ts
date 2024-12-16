import {actionWrapper} from '@/lib/actions';
import {getCategorise} from '@/server/actions/board.actions';
import {create} from 'zustand';

export type categoryGroup = {
  id: number;
  name: string;
  categories: CategoryItem[];
};

export type CategoryItem = {
  id: number;
  name: string;
  subCategories: {
    id: number;
    name: string;
  }[];
};

interface CategoryStore {
  isFetched: boolean;
  categories: categoryGroup[];

  getCategory: (id: number) => CategoryItem | undefined;
  getSubCategory: (id: number) => CategoryItem | undefined;

  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  isFetched: false,
  categories: [],
  categoryGroups: [],

  getCategory: id => {
    const {categories} = get();
    const category = categories.find(category =>
      category.categories.find(c => c.id === id),
    );

    if (!category) return undefined;

    return category.categories.find(c => c.id === id);
  },
  getSubCategory: id => {
    return undefined;
  },

  fetchCategories: async () => {
    const {categoryGroups} = await actionWrapper(getCategorise());
    set({isFetched: true, categories: categoryGroups});
  },
}));

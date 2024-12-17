import {actionWrapper} from '@/client/action/actionWapper';
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
  subCategories: SubCategoryItem[];
};

export type SubCategoryItem = {
  id: number;
  name: string;
};

interface CategoryStore {
  isFetched: boolean;
  categories: categoryGroup[];

  getCategory: (id: number) => CategoryItem | undefined;
  getSubCategory: (id: number) => SubCategoryItem | undefined;

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
    const {categories} = get();
    const category = categories.find(category =>
      category.categories.find(c =>
        c.subCategories.find(subCategory => subCategory.id === id),
      ),
    );

    if (!category) return undefined;

    const subCategory = category.categories
      .find(c => c.subCategories.find(subCategory => subCategory.id === id))
      ?.subCategories.find(subCategory => subCategory.id === id);

    return subCategory;
  },

  fetchCategories: async () => {
    const {categoryGroups} = await actionWrapper({
      action: getCategorise,
    });
    set({isFetched: true, categories: categoryGroups});
  },
}));

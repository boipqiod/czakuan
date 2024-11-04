import {create} from 'zustand';

export type categoryGroup = {
  name: string;
  categories: CategoryItem[];
};

export type CategoryItem = {
  id: number;
  name: string;
  subCategories?: CategoryItem[];
};

interface CategoryStore {
  categories: CategoryItem[];
  categoryGroups: categoryGroup[];

  getCategory: (id?: number) => CategoryItem | undefined;
  getSubCategory: (id?: number) => CategoryItem | undefined;

  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  categoryGroups: [],

  getCategory: id => {
    const {categories} = get();

    return categories.find(category => category.id === Number(id));
  },
  getSubCategory: id => {
    const {categories} = get();
    const subCategory = categories.find(category =>
      category.subCategories?.find(
        subCategory => subCategory.id === Number(id),
      ),
    );
    return subCategory?.subCategories?.find(
      subCategory => subCategory.id === Number(id),
    );
  },

  fetchCategories: async () => {},
}));

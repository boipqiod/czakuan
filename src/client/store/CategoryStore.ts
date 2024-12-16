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
  isFetched: boolean;
  categories: CategoryItem[];
  categoryGroups: categoryGroup[];

  getCategory: (id?: number) => CategoryItem | undefined;
  getSubCategory: (id?: number) => CategoryItem | undefined;

  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  isFetched: false,
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

  fetchCategories: async () => {
    const categories = [
      {
        id: 1,
        name: 'Category 1',
        subCategories: [
          {
            id: 11,
            name: 'Sub Category 1',
          },
          {
            id: 12,
            name: 'Sub Category 2',
          },
        ],
      },
      {
        id: 2,
        name: 'Category 2',
        subCategories: [
          {
            id: 21,
            name: 'Sub Category 1',
          },
          {
            id: 22,
            name: 'Sub Category 2',
          },
        ],
      },
    ];

    set({isFetched: true, categories});
  },
}));

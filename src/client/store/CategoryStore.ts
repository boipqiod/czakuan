import {actionWrapper} from '@/client/action/actionWapper';
import {getCategorise} from '@/server/actions/board.actions';
import {create} from 'zustand';

export type CategoryGroup = {
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
  categories: CategoryGroup[];

  getCategoryGroupByCategoryId: (id: number) => CategoryGroup | undefined;
  getCategory: (id: number) => CategoryItem | undefined;
  getSubCategory: (id: number) => SubCategoryItem | undefined;

  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  isFetched: false,
  categories: [
    {
      id: 1,
      name: '...',
      categories: [
        {
          id: 1,
          name: '...',
          subCategories: [
            {
              id: 1,
              name: '...',
            },
          ],
        },
      ],
    },
  ],
  categoryGroups: [
    {
      id: 1,
      name: '...',
      categories: [
        {
          id: 1,
          name: '...',
          subCategories: [
            {
              id: 1,
              name: '...',
            },
          ],
        },
      ],
    },
  ],

  getCategoryGroupByCategoryId: id => {
    const {categories} = get();
    return categories.find(categoryGroup =>
      categoryGroup.categories.find(category => category.id === id),
    );
  },
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
    await actionWrapper(getCategorise, {
      success: response => {
        const {
          data: {categoryGroups},
        } = response;
        set({isFetched: true, categories: categoryGroups});

        return response.data;
      },
    });
  },
}));

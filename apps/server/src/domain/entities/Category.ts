export interface CategoryGroup {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
}

export interface Category {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
  isAnonymous: boolean;
  isPrivateComment: boolean;
  groupId: number;
}

export interface SubCategory {
  id: number;
  name: string;
  priority: number;
  isUse: boolean;
  categoryId: number;
}

export interface CategoryWithSubs extends Category {
  subCategories: SubCategory[];
}

export interface CategoryGroupWithCategories extends CategoryGroup {
  categories: CategoryWithSubs[];
}

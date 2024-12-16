'use client';

import {useCategoryStore} from '@/client/store/CategoryStore';

type CategoryTitleProps = {
  categoryId?: number;
};
export const CategoryTitle = ({categoryId}: CategoryTitleProps) => {
  const {getCategory} = useCategoryStore();

  return (
    <div>
      {!categoryId && <h2>인기 게시글</h2>}
      {categoryId && <h2>{getCategory(categoryId)?.name}</h2>}
    </div>
  );
};

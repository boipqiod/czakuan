'use client';

import {colors} from '@/assets/color';
import {useQueryParams} from '@/client/hooks/useNavigate';
import {useCategoryStore} from '@/client/store/CategoryStore';
import {HFlex, Text} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {useEffect, useState} from 'react';

type CategoryTitleProps = {
  isSmall?: boolean;
  title?: string;
};
export const CategoryTitle = ({
  isSmall,
  title: originTitle,
}: CategoryTitleProps) => {
  const {addQuery, removeQuery, getQueryParams} = useQueryParams();
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [subCategoryId, setSubCategoryId] = useState<number | undefined>(
    undefined,
  );

  const [title, setTitle] = useState<string | undefined>(originTitle);

  useEffect(() => {
    console.log('window.location.href', window.location.href);

    const {categoryId: _categoryId, subCategoryId: _subCategoryId} =
      getQueryParams<{
        categoryId?: string;
        subCategoryId?: string;
      }>();
    const isPopular = window.location.pathname === '/popular/';

    setCategoryId(_categoryId ? Number(_categoryId) : undefined);
    setSubCategoryId(_subCategoryId ? Number(_subCategoryId) : undefined);

    setTitle(originTitle ?? getBoardName(isPopular));
  }, [window.location.href]);

  const {getCategory, getSubCategory} = useCategoryStore();
  const category = categoryId ? getCategory(categoryId) : undefined;
  const subCategory = subCategoryId ? getSubCategory(subCategoryId) : undefined;

  const onClickSubCategory = (_subCategoryId: number) => {
    if (subCategoryId === _subCategoryId) {
      removeQuery('subCategoryId');
    } else {
      addQuery({subCategoryId: _subCategoryId.toString()});
    }
  };

  const getBoardName = (isPopular: boolean) => {
    if (isPopular) {
      return '인기 게시글';
    }
    if (!category) {
      return '최근 게시글';
    }

    if (category && subCategory) {
      return category.name + ' > ' + subCategory.name;
    }

    return category.name;
  };

  return (
    <div>
      {isSmall ? <Text fontSize={'1.1rem'}>{title}</Text> : <h2>{title}</h2>}
      <HFlex gap={10}>
        {category &&
          category.subCategories.map(subCategory => (
            <Button
              backgroundColor={
                subCategoryId
                  ? subCategory.id === subCategoryId
                    ? colors['primary.500']
                    : '#444'
                  : '#444'
              }
              key={`subCategory-${subCategory.id}`}
              onClick={() => onClickSubCategory(subCategory.id)}>
              {subCategory.name}
            </Button>
          ))}
      </HFlex>
    </div>
  );
};

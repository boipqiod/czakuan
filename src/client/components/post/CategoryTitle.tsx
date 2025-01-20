'use client';

import {colors} from '@/assets/color';
import {useQueryParams} from '@/client/hooks/useNavigate';
import {useCategoryStore} from '@/client/store/CategoryStore';
import {HFlex} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';

type CategoryTitleProps = {
  isSmall?: boolean;
  title?: string;
};
export const CategoryTitle = ({isSmall, title}: CategoryTitleProps) => {
  const {categoryId: _categoryId, subCategoryId: _subCategoryId} =
    useQueryParams().getQueryParams<{
      categoryId?: string;
      subCategoryId?: string;
    }>();

  const categoryId = _categoryId ? Number(_categoryId) : undefined;
  const subCategoryId = _subCategoryId ? Number(_subCategoryId) : undefined;

  const isPopular = window.location.pathname === '/popular/';

  const {getCategory, getSubCategory} = useCategoryStore();
  const category = categoryId ? getCategory(categoryId) : undefined;
  const subCategory = subCategoryId ? getSubCategory(subCategoryId) : undefined;
  const {addQuery, removeQuery} = useQueryParams();

  const onClickSubCategory = (_subCategoryId: number) => {
    console.log('onClickSubCategory', subCategoryId, _subCategoryId);

    if (subCategoryId === _subCategoryId) {
      removeQuery('subCategoryId');
    } else {
      addQuery({subCategoryId: _subCategoryId.toString()});
    }
  };

  const getBoardName = () => {
    if (title) {
      return title;
    }
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
      {isSmall ? <h4>{getBoardName()}</h4> : <h2>{getBoardName()}</h2>}

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

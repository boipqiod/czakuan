'use client';

import {colors} from '@/assets/color';
import {useAddQeryPrams} from '@/client/hooks/useNavigate';
import {useCategoryStore} from '@/client/store/CategoryStore';
import {HFlex} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';

type CategoryTitleProps = {
  categoryId?: number;
  subCategoryId?: number;
};
export const CategoryTitle = ({
  categoryId,
  subCategoryId,
}: CategoryTitleProps) => {
  const {getCategory, getSubCategory} = useCategoryStore();
  const category = categoryId ? getCategory(categoryId) : undefined;
  const subCategory = subCategoryId ? getSubCategory(subCategoryId) : undefined;
  const addQuery = useAddQeryPrams();

  const onClickSubCategory = (subCategoryId: number) => {
    addQuery({subCategoryId: subCategoryId.toString()});
  };

  const getBoardName = () => {
    if (!category) {
      return '인기 게시글';
    }
    if (category && subCategory) {
      return category.name + ' > ' + subCategory.name;
    }

    return category.name;
  };

  return (
    <div>
      {!category && <h2>인기 게시글</h2>}
      {category && <h2>{getBoardName()}</h2>}
      <HFlex gap={10}>
        {category &&
          category.subCategories.map(subCategory => (
            <Button
              disabled={
                subCategoryId ? subCategory.id === subCategoryId : false
              }
              backgroundColor={
                subCategoryId
                  ? subCategory.id === subCategoryId
                    ? colors['primary.500']
                    : '#444'
                  : undefined
              }
              key={subCategory.id}
              onClick={() => onClickSubCategory(subCategory.id)}>
              {subCategory.name}
            </Button>
          ))}
      </HFlex>
    </div>
  );
};

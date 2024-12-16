'use client';

import {useCategoryStore} from '@/client/store/CategoryStore';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Flex} from '@/client/ui/widgets';
import {useEffect} from 'react';

export const SidePanel = () => {
  const {isSidebarOpen} = useLayoutStore();
  const {isFetched, categories, fetchCategories} = useCategoryStore();

  useEffect(() => {
    if (!isFetched) {
      fetchCategories();
    }
  }, []);

  if (!isSidebarOpen || !isFetched) return null;

  return (
    <Flex
      position={'absolute'}
      left={0}
      width={'100%'}
      height={'100%'}
      backgroundColor={'#1f1f1f'}
      zIndex={100}>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </Flex>
  );
};

'use client';

import {colors} from '@/assets/color';
import {useCategoryStore} from '@/client/store/CategoryStore';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {ClearButton} from '@/client/ui/widgets/Button';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export const SidePanel = () => {
  const router = useRouter();
  const {isSidebarOpen, toggleSidebar} = useLayoutStore();
  const {isFetched, categories, fetchCategories} = useCategoryStore();

  useEffect(() => {
    if (!isFetched) {
      fetchCategories();
    }
  }, []);

  const onClick = (categoryId: number) => {
    router.push(`/?categoryId=${categoryId}`);
    toggleSidebar();
  };

  if (!isSidebarOpen || !isFetched) return null;

  return (
    <Flex
      position={'absolute'}
      left={0}
      width={'100%'}
      height={'100%'}
      backgroundColor={'#1f1f1f'}
      zIndex={100}>
      <Flex padding={30} gap={20} maxWidth={400}>
        {categories.map(categoryGroup => (
          <div key={categoryGroup.id}>
            <Text
              padding={5}
              fontSize={'1.2rem'}
              color="#fff" //TODO: 색 변경
              backgroundColor={colors['primary.600']} //TODO: 색 변경
              borderRadius={4}
              marginBottom={10}>
              {categoryGroup.name}
            </Text>
            <HFlex flexWrap={'wrap'} gap={10}>
              {categoryGroup.categories.map(category => (
                <ClearButton
                  border={'1px solid #333'} //TODO: 색 변경
                  fontSize={'1.3rem'}
                  padding={5}
                  width={'45%'}
                  key={category.id}
                  textAlign={'left'}
                  onClick={() => onClick(category.id)}>
                  <Text>{category.name}</Text>
                </ClearButton>
              ))}
            </HFlex>
          </div>
        ))}
      </Flex>
    </Flex>
  );
};

'use client';

import {colors} from '@/assets/color';
import {useCategoryStore} from '@/client/store/CategoryStore';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {ClearButton} from '@/client/ui/widgets/Button';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useEffect} from 'react';

export const SidePanel = () => {
  const router = useRouter();
  const {isSidebarOpen, toggleSidebar, closeSidebar} = useLayoutStore();
  const {isFetched, categories, fetchCategories} = useCategoryStore();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    closeSidebar();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isFetched) {
      fetchCategories();
    }
  }, []);

  const onClick = (categoryId: number) => {
    router.push(`/?categoryId=${categoryId}`);
    toggleSidebar();
  };

  const onClickGeneral = (to: '' | 'popular') => {
    router.push(`/${to}`);
    toggleSidebar();
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isSidebarOpen]);

  if (!isSidebarOpen || !isFetched) return null;

  return (
    <Flex
      position={'absolute'}
      left={0}
      width={'100%'}
      backgroundColor={'#1f1f1f30'}
      height={'100%'}
      maxHeight={'100svh'}
      onClick={closeSidebar}
      zIndex={999}>
      <Flex
        left={0}
        width={'300px'}
        height={'100%'}
        maxHeight={'100svh'}
        backgroundColor={'#1f1f1f'}
        borderRight={'1px solid #333'} //TODO: 색 변경
        zIndex={2}>
        <Flex padding={10} gap={20} maxWidth={600}>
          <HFlex flexWrap={'wrap'} gap={10}>
            <ClearButton
              border={'1px solid #333'} //TODO: 색 변경
              fontSize={'1.3rem'}
              padding={5}
              width={'100%'}
              textAlign={'center'}
              onClick={() => {
                onClick(22);
              }}>
              <Text>{'시작관 야간 예약'}</Text>
            </ClearButton>
          </HFlex>
          <div>
            <HFlex flexWrap={'wrap'} gap={10}>
              <ClearButton
                border={'1px solid #333'} //TODO: 색 변경
                fontSize={'1.3rem'}
                padding={5}
                width={'45%'}
                textAlign={'left'}
                onClick={() => {
                  onClickGeneral('');
                }}>
                <Text>{'최근 게시글'}</Text>
              </ClearButton>
              <ClearButton
                border={'1px solid #333'} //TODO: 색 변경
                fontSize={'1.3rem'}
                padding={5}
                width={'45%'}
                textAlign={'left'}
                onClick={() => {
                  onClickGeneral('popular');
                }}>
                <Text>{'인기 게시글'}</Text>
              </ClearButton>
            </HFlex>
          </div>

          {categories.map(categoryGroup => (
            <div key={`categoryGroup-${categoryGroup.id}`}>
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
                {categoryGroup.categories.map(category => {
                  // TODO: "시작관 야간 예약" 표시하지 않음
                  if (category.id === 22) return null;

                  return (
                    <ClearButton
                      key={`category-${category.id}`}
                      border={'1px solid #333'} //TODO: 색 변경
                      fontSize={'1.3rem'}
                      padding={5}
                      width={'45%'}
                      textAlign={'left'}
                      onClick={() => onClick(category.id)}>
                      <Text>{category.name}</Text>
                    </ClearButton>
                  );
                })}
              </HFlex>
            </div>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

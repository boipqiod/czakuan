'use client';
import {colors} from '@/assets/color';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {ClearButton} from '@/client/ui/widgets/Button';
import {useRouter} from 'next/navigation';

const categories = [
  {
    name: '확인해주세요.',
    categories: [
      {to: '/report/post', name: '신고 당한 글'},
      {to: '/report/comment', name: '신고 당한 댓글'},
    ],
  },
  {
    name: '관리 메뉴',
    categories: [
      {to: '/', name: '게시판 관리'},
      {to: '/', name: '유저 관리'},
    ],
  },
];

export const SidePanel = () => {
  const {isSidebarOpen, closeSidebar} = useLayoutStore();
  const router = useRouter();

  const onClick = (to: string) => {
    router.push('/admin' + to);
  };

  if (!isSidebarOpen) return null;

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
          {categories.map(categoryGroup => (
            <div key={`categoryGroup-${categoryGroup.name}`}>
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
                    key={`category-${category.name}`}
                    border={'1px solid #333'} //TODO: 색 변경
                    fontSize={'1.3rem'}
                    padding={5}
                    width={'45%'}
                    textAlign={'left'}
                    onClick={() => onClick(category.to)}>
                    <Text>{category.name}</Text>
                  </ClearButton>
                ))}
              </HFlex>
            </div>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

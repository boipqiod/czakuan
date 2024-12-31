'use client';
import {Flex, Text} from '@/client/ui/widgets';
import {ClearButton} from '@/client/ui/widgets/Button';
import {useRouter} from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  return (
    <Flex width={'100%'} padding={'2rem'} flexWrap={'wrap'}>
      <ClearButton
        border={'1px solid #333'} //TODO: 색 변경
        fontSize={'1.3rem'}
        padding={5}
        width={'45%'}
        textAlign={'left'}
        onClick={() => {
          router.push('/admin/report/post');
        }}>
        <Text>신고 글 확인</Text>
      </ClearButton>
      <ClearButton
        border={'1px solid #333'} //TODO: 색 변경
        fontSize={'1.3rem'}
        padding={5}
        width={'45%'}
        textAlign={'left'}
        onClick={() => {
          router.push('/admin/report/comment');
        }}>
        <Text>신고 댓글 확인</Text>
      </ClearButton>
    </Flex>
  );
};

export default AdminPage;

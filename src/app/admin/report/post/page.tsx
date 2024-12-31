'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {getReportedPostList} from '@/server/actions/post.actions';
import {Role} from '@prisma/client';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

type ReportedPost = {
  userId: number;
  user: {
    id: number;
    nickName: string;
    profileImageUrl: string | null;
    role: Role;
  };
  postId: number;
  reason: string;
  createdAt: Date;
};

const Page = () => {
  const router = useRouter();
  const [list, setList] = useState<ReportedPost[]>([]);

  useEffect(() => {
    actionWrapper(() => getReportedPostList(1), {
      success: response => {
        setList(response.data.list);
      },
      error: error => {
        console.error('### 신고 글 조회 실패', error);
        router.replace('/');
      },
    });
  }, []);

  return (
    <Flex width={'100%'} gap={10} padding={20}>
      {list.map((item, index) => (
        <div key={`${item.postId}-${index}`}>
          <Flex padding={10} margin={'auto'} border={'1px solid #333'} gap={10}>
            <HFlex>
              <Text>신고자 : </Text>
              <Text>{item.user.nickName}</Text>
            </HFlex>
            <HFlex>
              <Text>신고 내용 :</Text>
              <Text>{item.reason}</Text>
            </HFlex>
            <div>{item.createdAt.toLocaleString()}</div>
            <Button
              onClick={() => {
                router.push(`/post/${item.postId}`);
              }}>
              게시글
            </Button>
          </Flex>
        </div>
      ))}
    </Flex>
  );
};

export default Page;

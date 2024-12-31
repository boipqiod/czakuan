'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {Divider} from '@/client/ui/widgets/Divider';
import {getReportedCommentList} from '@/server/actions/post.comment.actions';
import {Role} from '@prisma/client';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

type ReportedComment = {
  commentId: number;
  reason: string;
  user: {
    id: number;
    nickName: string;
    profileImageUrl: string | null;
    role: Role;
  };
  comment: {
    content: string;
    postId: number;
    author: {
      id: number;
      nickName: string;
    };
  };
  createdAt: Date;
};

const Page = () => {
  const router = useRouter();
  const [list, setList] = useState<ReportedComment[]>([]);

  useEffect(() => {
    actionWrapper(() => getReportedCommentList(1), {
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
        <div key={`${item.commentId}-${index}`}>
          <Flex padding={10} margin={'auto'} border={'1px solid #333'} gap={10}>
            <HFlex>
              <Text>신고자 : </Text>
              <Text>{item.user.nickName}</Text>
            </HFlex>
            <HFlex>
              <Text>신고 내용 :</Text>
              <Text>{item.reason}</Text>
            </HFlex>
            <Divider />
            <HFlex>
              <Text>작성자 :</Text>
              <Text>{item.comment.author.nickName}</Text>
            </HFlex>
            <HFlex>
              <Text>신고 댓글 : </Text>
              <Text>{item.comment.content}</Text>
            </HFlex>
            <div>{item.createdAt.toLocaleString()}</div>
            <Button
              onClick={() => {
                router.push(`/post/${item.comment.postId}`);
              }}>
              게시글 보러 가기
            </Button>
          </Flex>
        </div>
      ))}
    </Flex>
  );
};

export default Page;

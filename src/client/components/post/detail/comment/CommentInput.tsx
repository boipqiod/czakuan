'use client';

import {useAuthStore} from '@/client/store/AuthStore';
import {Flex} from '@/client/ui/widgets';

type CommentInputProps = {
  postId: number;
  parentId?: number;
};
export const CommentInput = ({postId, parentId}: CommentInputProps) => {
  const {isLogin} = useAuthStore();

  return (
    <Flex width={'100vw'} height={'100svh'} backgroundColor={'#f8f9fa30'}>
      <Flex width={'100%'}></Flex>
    </Flex>
  );
};

export const CommentInputButton = (props: CommentInputProps) => {
  return <Flex width={'100%'}>입력</Flex>;
};

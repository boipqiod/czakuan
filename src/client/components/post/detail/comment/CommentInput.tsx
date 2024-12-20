'use client';

import {colors} from '@/assets/color';
import {actionWrapper} from '@/client/action/actionWapper';
import {useAuthStore} from '@/client/store/AuthStore';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import {createComment} from '@/server/actions/post.comment.actions';
import {CommentType} from '@/types/post';
import {useState} from 'react';
import {IoMdSend} from 'react-icons/io';

type CommentInputProps = {
  postId: number;
  parentComment?: CommentType;
  rootId?: number;
  addComment: (comment: CommentType) => void;
  onClose?: () => void;
};

export const CommentInput = ({
  postId,
  parentComment,
  rootId,
  addComment,
  onClose,
}: CommentInputProps) => {
  const {isLogin, user} = useAuthStore();
  const [comment, setComment] = useState<string>('');
  const {author: parentAuthor, id: parentId} = parentComment || {};

  const handleChangeComment = (value: string) => {
    setComment(value);
  };

  const registerComment = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    const {id: authorId} = user;

    if (!comment || comment.trim() === '') {
      alert('댓글을 입력해주세요.');
      return;
    }

    actionWrapper({
      action: () => createComment(postId, authorId, comment, parentId, rootId),
      success: response => {
        setComment('');
        const {data} = response;
        addComment(data);
        onClose && onClose();
        alert('댓글이 등록되었습니다.');
      },
    });
  };

  return (
    <Flex width={'100%'} marginTop={20} gap={10}>
      {parentAuthor && (
        <HFlex>
          <Text fontWeight={'bold'} color={colors.blue}>
            @{parentAuthor.nickName}
          </Text>
          님에게 댓글
        </HFlex>
      )}
      <HFlex gap={10}>
        <Input
          value={comment}
          width={'100%'}
          height={10}
          borderRadius={3}
          disabled={!isLogin}
          placeholder={isLogin ? '댓글을 입력해주세요' : '로그인이 필요합니다.'}
          onChange={handleChangeComment}
        />
        <Button
          disabled={!isLogin}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          onClick={registerComment}>
          <IoMdSend />
        </Button>
      </HFlex>
    </Flex>
  );
};

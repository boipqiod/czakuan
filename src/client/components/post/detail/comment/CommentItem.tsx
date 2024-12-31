'use client';
import {colors} from '@/assets/color';
import {actionWrapper} from '@/client/action/actionWapper';
import {CommentInput} from '@/client/components/post/detail/comment/CommentInput';
import {useComment} from '@/client/hooks/useComment';
import {useAuthStore} from '@/client/store/AuthStore';
import {Profile} from '@/client/ui/components/Profile';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  Flex,
  HFlex,
  Text,
} from '@/client/ui/widgets';
import {Badge} from '@/client/ui/widgets/Badge';
import {Button, ClearButton} from '@/client/ui/widgets/Button';
import {formatRelativeTime} from '@/lib/dayjs';
import {reportComment} from '@/server/actions/post.comment.actions';
import {CommentType} from '@/types/post';
import {useState} from 'react';
import {AiOutlineDislike, AiOutlineLike} from 'react-icons/ai';
import {IoIosMore} from 'react-icons/io';
import {LuDot} from 'react-icons/lu';

type CommentItemProps = {
  ownerId: number;
  comment: CommentType;
  parentComment?: CommentType;
  addComment: (comment: CommentType) => void;
};

export const CommentItem = ({
  ownerId,
  comment,
  parentComment,
  addComment,
}: CommentItemProps) => {
  const {author: parentAuthor} = parentComment || {};
  const {isLogin, user} = useAuthStore();

  const {
    isPostOwner,
    isHasParent,
    isDeleted,
    isCommentOwner,
    isLike,
    isDislike,
    likeCount,
    onClickLike,
    onClickDislike,
    handleDelete,
  } = useComment(ownerId, comment, parentComment?.author);

  const [openReply, setOpenReply] = useState(false);
  const report = () => {
    if (!isLogin || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const reason = prompt('신고 사유를 입력해주세요.');

    if (!reason) {
      return;
    }

    if (reason.trim().length < 5) {
      alert('신고 사유는 5자 이상 입력해주세요.');
      return;
    }

    actionWrapper(() => reportComment(comment.id, user.id, reason), {
      success: () => {
        alert('신고가 완료되었습니다.');
      },
    });
  };

  return (
    <Flex gap={6} padding={5} marginLeft={isHasParent ? 30 : 0}>
      <HFlex
        padding={5}
        borderBottom={'1px solid #444'}
        alignItems={'center'}
        justifyContent={'space-between'}>
        <HFlex alignItems={'center'}>
          <Profile author={comment.author} />
          {isPostOwner && <Badge bg={colors['primary.700']}>작성자</Badge>}
          <LuDot />
          {formatRelativeTime(comment.createdAt)}
          <LuDot />
          <HFlex gap={4}>
            <AiOutlineLike />
            {likeCount}
          </HFlex>
        </HFlex>
        <HFlex>
          <DropdownMenu isRight>
            <DropdownMenuButton>
              <IoIosMore color={'white'} />
            </DropdownMenuButton>
            {isCommentOwner && !isDeleted && (
              <DropdownMenuItem onClick={handleDelete}>삭제</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={report}>신고</DropdownMenuItem>
          </DropdownMenu>
        </HFlex>
      </HFlex>

      <Flex padding={10}>
        {parentAuthor && (
          <Text color={colors['blue']} fontWeight={'bold'} fontSize={'1.1rem'}>
            @{parentAuthor?.nickName}
          </Text>
        )}
        <div>
          {isDeleted ? (
            <Text color={'#d0d0d0'} fontSize={'0.9rem'}>
              삭제된 댓글입니다.
            </Text>
          ) : (
            comment.content
          )}
        </div>
      </Flex>
      <HFlex alignItems={'center'} gap={4} paddingLeft={10}>
        <Button onClick={() => setOpenReply(!openReply)}>답글</Button>
        <ClearButton onClick={onClickLike}>
          <HFlex gap={3}>
            <AiOutlineLike color={isLike ? colors['primary.500'] : 'white'} />
          </HFlex>
        </ClearButton>
        <ClearButton
          width={10}
          onClick={onClickDislike}
          color={isDislike ? colors['red.400'] : 'white'}>
          <AiOutlineDislike />
        </ClearButton>
      </HFlex>
      {openReply && (
        <CommentInput
          postId={comment.postId}
          rootId={comment.rootId}
          parentComment={comment}
          addComment={addComment}
          onClose={() => setOpenReply(false)}
        />
      )}
    </Flex>
  );
};

'use client';
import {colors} from '@/assets/color';
import {useComment} from '@/client/hooks/useComment';
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
import {CommentType} from '@/types/post';
import {Author} from '@/types/user';
import {AiOutlineDislike, AiOutlineLike} from 'react-icons/ai';
import {IoIosMore} from 'react-icons/io';
import {LuDot} from 'react-icons/lu';

type CommentItemProps = {
  ownerId: number;
  comment: CommentType;
  parentAuthor?: Author;
};

export const CommentItem = ({
  ownerId,
  comment,
  parentAuthor,
}: CommentItemProps) => {
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
  } = useComment(ownerId, comment, parentAuthor);

  return (
    <Flex gap={6} padding={'10px 0'} marginLeft={isHasParent ? 30 : 0}>
      <HFlex
        borderBottom={'1px solid #444'}
        borderRadius={'4px'}
        alignItems={'center'}
        justifyContent={'space-between'}>
        <HFlex alignItems={'center'}>
          <Profile author={comment.author} />
          {isPostOwner && <Badge bg={colors['primary.700']}>작성자</Badge>}
        </HFlex>
        <HFlex>
          <DropdownMenu isRight>
            <DropdownMenuButton>
              <IoIosMore color={'white'} />
            </DropdownMenuButton>
            {isCommentOwner && !isDeleted && (
              <DropdownMenuItem onClick={handleDelete}>삭제</DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                alert('기능 준비중입니다.');
              }}>
              신고
            </DropdownMenuItem>
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
      <HFlex alignItems={'center'} gap={4}>
        <Button>답글</Button>
        <ClearButton onClick={onClickLike}>
          <HFlex gap={3}>
            <AiOutlineLike color={isLike ? colors['primary.500'] : 'white'} />
            {likeCount}
          </HFlex>
        </ClearButton>
        <ClearButton
          onClick={onClickDislike}
          color={isDislike ? colors['red.400'] : 'white'}>
          <AiOutlineDislike />
        </ClearButton>
        <LuDot />
        {formatRelativeTime(comment.createdAt)}
      </HFlex>
    </Flex>
  );
};

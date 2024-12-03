'use client';
import {colors} from '@/assets/color';
import {useComment} from '@/client/hooks/useComment';
import {Profile} from '@/client/ui/components/Profile';
import {Flex, HFlex, Text} from '@/client/ui/widgets';
import {Button, ClearButton} from '@/client/ui/widgets/Button';
import {formatRelativeTime} from '@/lib/dayjs';
import {CommentReslut} from '@/types/post';
import {Author} from '@/types/user';
import {AiOutlineDislike, AiOutlineLike} from 'react-icons/ai';
import {LuDot} from 'react-icons/lu';

type CommentItemProps = {
  ownerId: number;
  comment: CommentReslut;
  parentAuthor?: Author;
};

export const CommentItem = ({
  ownerId,
  comment,
  parentAuthor,
}: CommentItemProps) => {
  const {
    bgColor,
    isHasParent,
    isLike,
    isDislike,
    likeCount,
    onClickLike,
    onClickDislike,
  } = useComment(ownerId, comment, parentAuthor);

  return (
    <Flex gap={6} padding={'10px 0'} marginLeft={isHasParent ? 20 : 0}>
      <HFlex
        borderRadius={'4px'}
        backgroundColor={bgColor}
        padding={'2px 4px'}
        alignItems={'center'}>
        <Profile author={comment.author} />
        <LuDot />
        {formatRelativeTime(comment.createdAt)}
        <LuDot />
        <HFlex gap={2}>
          <AiOutlineLike />
          {likeCount}
        </HFlex>
      </HFlex>
      <Flex>
        {parentAuthor && (
          <Text color={colors['blue']} fontWeight={'bold'}>
            @{parentAuthor?.nickName}
          </Text>
        )}
        <div>{comment.content}</div>
      </Flex>
      <HFlex alignItems={'center'} gap={4}>
        <Button>답글</Button>
        <LuDot />
        <ClearButton onClick={onClickLike}>
          <AiOutlineLike />
        </ClearButton>
        <ClearButton onClick={onClickDislike}>
          <AiOutlineDislike />
        </ClearButton>
      </HFlex>
    </Flex>
  );
};

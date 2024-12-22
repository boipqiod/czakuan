'use client';

import {colors} from '@/assets/color';
import {actionWrapper} from '@/client/action/actionWapper';
import {useAuthStore} from '@/client/store/AuthStore';
import {Flex, HFlex} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {dislikePost, likePost} from '@/server/actions/post.actions';
import {PostDetailType} from '@/types/post';
import {useEffect, useState} from 'react';
import {AiOutlineDislike, AiOutlineLike} from 'react-icons/ai';

type PostLikeProps = {
  post: PostDetailType;
};
export const PostLike = ({post}: PostLikeProps) => {
  const {user} = useAuthStore();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes.length);

  useEffect(() => {
    if (!user) {
      setIsLiked(false);
      setIsDisliked(false);
      return;
    }
    setIsLiked(post.likes.some(like => like.userId === user.id));
    setIsDisliked(post.dislikes.some(dislike => dislike.userId === user.id));
  }, [user]);

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    await actionWrapper(() => likePost(post.id, user.id), {
      success: () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      },
    });
  };

  const handleDislike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    await actionWrapper(() => dislikePost(post.id, user.id), {
      success: () => {
        setIsDisliked(!isDisliked);
        setDislikeCount(isDisliked ? dislikeCount - 1 : dislikeCount + 1);
      },
    });
  };

  return (
    <HFlex justifyContent={'center'} alignItems={'center'} gap={10}>
      <Button onClick={handleLike}>
        <Flex gap={5} padding={2} color={isLiked ? colors.primary : undefined}>
          <HFlex gap={3}>
            좋아요 <AiOutlineLike />
          </HFlex>
          {likeCount}
        </Flex>
      </Button>
      <Button onClick={handleDislike}>
        <Flex
          gap={5}
          padding={2}
          color={isDisliked ? colors['red.300'] : undefined}>
          <HFlex gap={3}>
            싫어요 <AiOutlineDislike />
          </HFlex>
          {dislikeCount}
        </Flex>
      </Button>
    </HFlex>
  );
};

import {CommentReslut} from '@/types/post';
import {Author} from '@/types/user';
import {useState} from 'react';

export const useComment = (
  ownerId: number,
  comment: CommentReslut,
  parentAuthor?: Author,
) => {
  const isPostOwner = ownerId === comment.author.id;
  const isHasParent = !!parentAuthor;
  const bgColor = isPostOwner ? '#666' : '#444';

  const {isLogin, user} = {
    isLogin: true,
    user: undefined,
  } as {isLogin: boolean; user?: Author};

  const [isLike, setIsLike] = useState(
    comment.likes.some(like => like.userId === user?.id),
  );
  const [likeCount, setLikeCount] = useState(comment.likes.length);
  const [isDislike, setIsDislike] = useState(
    comment.dislikes.some(dislike => dislike.userId === user?.id),
  );
  const [dislikeCount, setDislikeCount] = useState(comment.dislikes.length);

  const onClickLike = () => {
    if (!isLogin) {
      return;
    }

    if (isLike) {
      setIsLike(false);
      setLikeCount(likeCount - 1);
    } else {
      setIsLike(true);
      setLikeCount(likeCount + 1);
    }
  };

  const onClickDislike = () => {
    if (!isLogin) {
      return;
    }

    if (isDislike) {
      setIsDislike(false);
      setDislikeCount(dislikeCount - 1);
    } else {
      setIsDislike(true);
      setDislikeCount(dislikeCount + 1);
    }
  };

  return {
    bgColor,
    isHasParent,
    isLike,
    isDislike,
    likeCount,
    dislikeCount,
    onClickLike,
    onClickDislike,
  };
};

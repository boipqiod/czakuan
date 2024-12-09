import {useAuthStore} from '@/client/store/AuthStore';
import {
  dislikeComment,
  likeComment,
} from '@/server/actions/post.comment.actions';
import {CommentReslut} from '@/types/post';
import {Author} from '@/types/user';
import {useEffect, useState} from 'react';

export const useComment = (
  ownerId: number,
  comment: CommentReslut,
  parentAuthor?: Author,
) => {
  const isPostOwner = ownerId === comment.author.id;
  const isHasParent = !!parentAuthor;
  const bgColor = isPostOwner ? '#666' : '#444';

  const {isLogin, user} = useAuthStore();

  const [isLike, setIsLike] = useState(
    comment.likes.some(like => like.userId === user?.id),
  );
  const [likeCount, setLikeCount] = useState(comment.likes.length);
  const [isDislike, setIsDislike] = useState(
    comment.dislikes.some(dislike => dislike.userId === user?.id),
  );
  const [dislikeCount, setDislikeCount] = useState(comment.dislikes.length);

  useEffect(() => {
    setIsLike(comment.likes.some(like => like.userId === user?.id));
    setLikeCount(comment.likes.length);
    setIsDislike(comment.dislikes.some(dislike => dislike.userId === user?.id));
    setDislikeCount(comment.dislikes.length);
  }, [isLogin]);

  const onClickLike = () => {
    if (!isLogin || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isLike) {
      setIsLike(false);
      setLikeCount(likeCount - 1);
    } else {
      setIsLike(true);
      setLikeCount(likeCount + 1);
    }

    likeComment(comment.id, user.id);
  };

  const onClickDislike = () => {
    if (!isLogin || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isDislike) {
      setIsDislike(false);
      setDislikeCount(dislikeCount - 1);
    } else {
      setIsDislike(true);
      setDislikeCount(dislikeCount + 1);
    }
    dislikeComment(comment.id, user.id);
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

import {actionWrapper} from '@/client/action/actionWapper';
import {useAuthStore} from '@/client/store/AuthStore';
import {
  deleteComment,
  dislikeComment,
  likeComment,
} from '@/server/actions/post.comment.actions';
import {CommentType} from '@/types/post';
import {Author} from '@/types/user';
import {useEffect, useState} from 'react';

export const useComment = (
  ownerId: number,
  comment: CommentType,
  parentAuthor?: Author,
) => {
  const {isLogin, user} = useAuthStore();

  const [isLike, setIsLike] = useState(
    comment.likes.some(like => like.userId === user?.id),
  );
  const [likeCount, setLikeCount] = useState(comment.likes.length);
  const [isDislike, setIsDislike] = useState(
    comment.dislikes.some(dislike => dislike.userId === user?.id),
  );
  const [dislikeCount, setDislikeCount] = useState(comment.dislikes.length);

  const isPostOwner = ownerId === comment.author.id;
  const isHasParent = comment.parentId !== null;
  const isDeleted = !!comment.deletedAt;
  const isCommentOwner = user?.id === comment.author.id;

  useEffect(() => {
    console.log('useEffect', isCommentOwner);

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

    actionWrapper(() => likeComment(comment.id, user.id), {
      success: () => {
        setIsLike(!isLike);
        setLikeCount(isLike ? likeCount - 1 : likeCount + 1);
      },
    });
  };

  const onClickDislike = () => {
    if (!isLogin || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    actionWrapper(() => dislikeComment(comment.id, user.id), {
      success: () => {
        setIsDislike(!isDislike);
        setDislikeCount(isDislike ? dislikeCount - 1 : dislikeCount + 1);
      },
    });
  };

  const handleDelete = () => {
    if (!isLogin || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!isCommentOwner) {
      alert('작성자만 삭제할 수 있습니다.');
      return;
    }

    actionWrapper(() => deleteComment(comment.id, user.id), {
      success: () => {
        alert('삭제되었습니다.');
      },
    });
  };

  return {
    isDeleted,
    isPostOwner,
    isHasParent,
    isCommentOwner,
    isLike,
    isDislike,
    likeCount,
    dislikeCount,
    onClickLike,
    onClickDislike,
    handleDelete,
  };
};

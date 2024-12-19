'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {CommentInputButton} from '@/client/components/post/detail/comment/CommentInput';
import {CommentItem} from '@/client/components/post/detail/comment/CommentItem';
import {Flex} from '@/client/ui/widgets';
import {Pagination} from '@/client/ui/widgets/Pagination';
import {getCommentList} from '@/server/actions/post.comment.actions';
import {CommentResultType, PostDetailType} from '@/types/post';
import {useEffect, useState} from 'react';

type CommentItemsType = {
  post: PostDetailType;
  commentRelust: CommentResultType;
};
export const CommentItems = ({
  post,
  commentRelust: originCommentResult,
}: CommentItemsType) => {
  const {author: postAuthor, id: postId} = post;
  const [page, setPage] = useState(1);
  const [commentResult, setCommentResult] = useState(originCommentResult);
  const {list, lastPage} = commentResult;

  if (list.length === 0) {
    return <p>작성된 댓글이 없습니다.</p>;
  }

  useEffect(() => {
    if (page === 1) {
      setCommentResult(originCommentResult);
    } else {
      actionWrapper({
        action: () => getCommentList(postId, page),
        success: response => {
          const {data} = response;
          if (data) setCommentResult(data);
        },
      });
    }
  }, [page]);

  return (
    <Flex>
      {list.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          ownerId={postAuthor.id}
          parentAuthor={list.find(c => c.id === comment.parentId)?.author}
        />
      ))}
      <Pagination lastPage={lastPage} currentPage={page} setPage={setPage} />
      <CommentInputButton postId={postId} parentId={undefined} />
    </Flex>
  );
};

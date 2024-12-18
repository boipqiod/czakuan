'use client';

import {CommentItem} from '@/client/components/post/detail/comment/CommentItem';
import {CommentType} from '@/types/post';
import {Author} from '@/types/user';

type CommentItemsType = {
  postAuthor: Author;
  comments: CommentType[];
};
export const CommentItems = ({postAuthor, comments}: CommentItemsType) => {
  if (comments.length === 0) {
    return <p>작성된 댓글이 없습니다.</p>;
  }

  return comments.map(comment => (
    <CommentItem
      key={comment.id}
      comment={comment}
      ownerId={postAuthor.id}
      parentAuthor={comments.find(c => c.id === comment.parentId)?.author}
    />
  ));
};

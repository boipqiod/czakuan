'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {CommentInput} from '@/client/components/post/detail/comment/CommentInput';
import {CommentItem} from '@/client/components/post/detail/comment/CommentItem';
import {Flex} from '@/client/ui/widgets';
import {Pagination} from '@/client/ui/widgets/Pagination';
import {getCommentList} from '@/server/actions/post.comment.actions';
import {CommentResultType, CommentType, PostDetailType} from '@/types/post';
import {useEffect, useState} from 'react';

type CommentItemsType = {
  post: PostDetailType;
  commentResult: CommentResultType;
};

export const CommentItems = ({
  post,
  commentResult: originCommentResult,
}: CommentItemsType) => {
  const {
    id: postId,
    author: {id: ownerId},
  } = post;
  const [page, setPage] = useState<number>();
  const [commentResult, setCommentResult] = useState(originCommentResult);
  const {list, lastPage} = commentResult;
  const [addedComment, setAddedComment] = useState<CommentType[]>([]);
  const commentList = [...list, ...addedComment];
  const groupList = groupByIndex(commentList);

  useEffect(() => {
    if (page) fetchComments(page);
  }, [page]);

  const fetchComments = async (page: number) => {
    actionWrapper(() => getCommentList(postId, page), {
      success: response => {
        const {data} = response;
        if (data) setCommentResult(data);
      },
    });
  };

  const handleAddComment = (comment: CommentType) => {
    setAddedComment([...addedComment, comment]);
  };

  return (
    <Flex>
      {commentList.length === 0 && <p>작성된 댓글이 없습니다.</p>}
      {groupList.map((comments, index) => (
        <CommentGroup
          key={'CommentItems' + index}
          commentList={comments}
          ownerId={ownerId}
        />
      ))}
      <Pagination
        lastPage={lastPage}
        currentPage={page ?? commentResult.lastPage}
        setPage={setPage}
      />
      <CommentInput postId={postId} addComment={handleAddComment} />
    </Flex>
  );
};

const CommentGroup = ({
  commentList: originCommentList,
  ownerId,
}: {
  commentList: CommentType[];
  ownerId: number;
}) => {
  const [addedComment, setAddedComment] = useState<CommentType[]>([]);
  const commentList = [...originCommentList, ...addedComment];

  const addComment = (comment: CommentType) => {
    setAddedComment([...addedComment, comment]);
  };

  return commentList.map((comment, index) => {
    return (
      <CommentItem
        key={comment.id}
        comment={comment}
        ownerId={ownerId}
        addComment={addComment}
        parentComment={commentList.find(c => c.id === comment.parentId)}
      />
    );
  });
};

function groupByIndex(dataList: CommentType[]): CommentType[][] {
  const groupMap: {[key: number]: CommentType[]} = {};
  dataList.forEach(item => {
    if (item.rootId) {
      if (!groupMap[item.rootId]) {
        groupMap[item.rootId] = [];
      }
      groupMap[item.rootId].push(item);
    }
  });

  return Object.values(groupMap);
}

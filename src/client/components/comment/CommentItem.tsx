import {Profile} from '@/client/ui/components/Profile';
import {CommentReslut} from '@/types/post';
import {Author} from '@/types/user';

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
  return (
    <div>
      <div>
        <Profile author={comment.author} />
      </div>
      <div>{comment.content}</div>
    </div>
  );
};

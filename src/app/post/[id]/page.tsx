import {CommentItem} from '@/client/components/comment/CommentItem';
import {Profile} from '@/client/ui/components/Profile';
import {Flex, HFlex} from '@/client/ui/widgets';
import {Button} from '@/client/ui/widgets/Button';
import {Divider} from '@/client/ui/widgets/Divider';
import {formatRelativeTime} from '@/lib/dayjs';
import {getCommentList, getPostDetail} from '@/server/actions/post.actions';
import {AiOutlineDislike, AiOutlineLike} from 'react-icons/ai';
import {FiEye} from 'react-icons/fi';
import {LuDot} from 'react-icons/lu';

const PostDetailPage = async (data: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const {id} = await data.params;

  const [post, commentListItem] = await Promise.all([
    getPostDetail(Number(id)),
    getCommentList(Number(id), 1),
  ]);

  const {author} = post;

  if (!post || !commentListItem) {
    return <div>Post not found</div>;
  }

  const {list: comments} = commentListItem;

  console.log('post', post, comments);

  return (
    <Flex width={'100%'}>
      {/* title */}
      <section>
        <HFlex>
          <h1>{post.title}</h1>
        </HFlex>
        <Divider marginBottom={10} />
        <HFlex alignItems={'center'}>
          <Profile author={author} />
          <LuDot />
          <>{formatRelativeTime(post.createdAt)}</>
          <LuDot />
          <>
            <FiEye />
            {post.views}
          </>
        </HFlex>
      </section>
      {/* content */}
      <section>
        <Flex margin={20}>
          <div dangerouslySetInnerHTML={{__html: post.content}}></div>
        </Flex>
        <HFlex justifyContent={'center'} alignItems={'center'} gap={10}>
          <Button>
            좋아요 <AiOutlineLike />
            {post.likes.length}
          </Button>
          <Button>
            싫어요 <AiOutlineDislike /> {post.dislikes.length}
          </Button>
        </HFlex>
        <Divider marginY={10} />
      </section>
      <section>
        <h2>Comments</h2>
        <Divider marginY={10} />
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            ownerId={author.id}
            parentAuthor={comments.find(c => c.id === comment.parentId)?.author}
          />
        ))}
      </section>
    </Flex>
  );
};

export default PostDetailPage;

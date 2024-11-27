import {Profile} from '@/client/ui/components/Profile';
import {Flex, HFlex} from '@/client/ui/widgets';
import {Divider} from '@/client/ui/widgets/Divider';
import {formatRelativeTime} from '@/lib/dayjs';
import {getCommentList, getPostDetail} from '@/server/actions/post.actions';
import {FiEye} from 'react-icons/fi';
import {LuDot} from 'react-icons/lu';

const PostDetailPage = async (data: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const {id} = await data.params;
  console.log('id', id);

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
        <HFlex justifyContent={'center'} alignItem={'center'}>
          <button>Like {post.likes.length}</button>
          <button>Dislike {post.dislikes.length}</button>
        </HFlex>
        <Divider marginY={10} />
      </section>
      <section>
        <h2>Comments</h2>
        <Divider marginY={10} />
        {comments.map(comment => (
          <div key={comment.id}>
            <div>{comment.content}</div>
            <div>
              <Profile author={comment.author} />
            </div>
          </div>
        ))}
      </section>
    </Flex>
  );
};

export default PostDetailPage;

'use client';
import {CommentItems} from '@/client/components/post/detail/comment/CommentItems';
import {PostAuthor} from '@/client/components/post/detail/PostAuthor';
import {PostContent} from '@/client/components/post/detail/PostContent';
import {PostLike} from '@/client/components/post/detail/PostLike';
import {Flex, HFlex} from '@/client/ui/widgets';
import {Divider} from '@/client/ui/widgets/Divider';
import {CommentType, PostDetailType} from '@/types/post';

type PostDetailProps = {
  post: PostDetailType;
  comments: CommentType[];
};
export const PostDetail = ({post, comments}: PostDetailProps) => {
  const {author} = post;

  return (
    <Flex minWidth={'100%'}>
      {/* title */}
      <section>
        <HFlex>
          <h1>{post.title}</h1>
        </HFlex>
        <Divider marginBottom={10} />
        <PostAuthor post={post} />
      </section>
      {/* content */}
      <section>
        <PostContent content={post.content} />
        <PostLike post={post} />
        <Divider marginY={10} />
      </section>
      <section>
        <h3>댓글</h3>
        <CommentItems postAuthor={author} comments={comments} />
      </section>
    </Flex>
  );
};

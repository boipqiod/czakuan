'use client';
import {CommentItems} from '@/client/components/post/detail/comment/CommentItems';
import {PostAuthor} from '@/client/components/post/detail/PostAuthor';
import {PostContent} from '@/client/components/post/detail/PostContent';
import {PostLike} from '@/client/components/post/detail/PostLike';
import {Flex, HFlex} from '@/client/ui/widgets';
import {Divider} from '@/client/ui/widgets/Divider';
import {CommentResultType, PostDetailType} from '@/types/post';

type PostDetailProps = {
  post: PostDetailType;
  commentRelust: CommentResultType;
};
export const PostDetail = ({post, commentRelust}: PostDetailProps) => {
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
        <CommentItems post={post} commentRelust={commentRelust} />
      </section>
    </Flex>
  );
};

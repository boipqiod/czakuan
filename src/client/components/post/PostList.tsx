'use client';
import {PostItem, PostItemProps} from '@/client/components/post/PostItem';
import {Flex} from '@/client/ui/widgets';

export const PostList = ({posts}: {posts: PostItemProps[]}) => {
  return (
    <Flex gap={10}>
      {posts.map(post => (
        <PostItem key={post.id} {...post} />
      ))}
    </Flex>
  );
};

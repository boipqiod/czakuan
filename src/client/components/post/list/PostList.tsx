'use client';
import {PostItem} from '@/client/components/post/list/PostItem';
import {Flex} from '@/client/ui/widgets';
import {PostListType} from '@/types/post';
import {useParams} from 'next/navigation';

type PostListProps = {
  posts: PostListType[];
  isShowNoPost?: boolean;
};

export const PostList = ({posts, isShowNoPost = false}: PostListProps) => {
  const {id: postId} = useParams<{id?: string}>();

  return (
    <Flex>
      {posts.map((post, index) => (
        <PostItem
          key={post.id + index.toString()}
          {...post}
          isNowPost={Number(postId) === post.id}
        />
      ))}
      {isShowNoPost && posts.length === 0 && <p>작성된 글이 없습니다.</p>}
    </Flex>
  );
};

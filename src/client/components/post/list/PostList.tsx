import {PostItem} from '@/client/components/post/list/PostItem';
import {PostListType} from '@/types/post';
import {useParams} from 'next/navigation';

type PostListProps = {
  posts: PostListType[];
  categoryId?: number;
  categoryNmae?: string;
};

export const Postlist = ({posts}: PostListProps) => {
  const {id: postId} = useParams<{id?: string}>();
  return (
    <>
      {posts.map((post, index) => (
        <PostItem
          key={post.id + index.toString()}
          {...post}
          isNowPost={Number(postId) === post.id}
        />
      ))}
      {list.length === 0 && <p>작성된 글이 없습니다.</p>}
    </>
  );
};

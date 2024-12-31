import {actionWrapper} from '@/client/action/actionWapper';
import {AddPost} from '@/client/components/post/AddPost';
import {PostItem} from '@/client/components/post/list/PostItem';
import {Flex} from '@/client/ui/widgets';
import {Pagination} from '@/client/ui/widgets/Pagination';
import {getNoticeList, getPostList} from '@/server/actions/post.actions';

type PostListProps = {
  page: number;
  categoryId?: number;
  subCategoryId?: number;
  postId?: number;
};
export const PostList = async ({
  page,
  categoryId,
  subCategoryId,
  postId,
}: PostListProps) => {
  const [genelerNoticeResult, noticeResult, postListResult] = await Promise.all(
    [
      actionWrapper(getNoticeList, {
        options: {revalidate: 1000 * 60 * 60},
      }),
      categoryId ? actionWrapper(() => getNoticeList(categoryId)) : {list: []},
      actionWrapper(() => getPostList({page, categoryId, subCategoryId})),
    ],
  );

  const {list: notice} = noticeResult!;
  const {page: currentPage, list, lastPage} = postListResult!;
  const {list: allNotice} = genelerNoticeResult ?? {list: []};

  const posts = [...allNotice, ...notice, ...list];

  console.log('posts', {genelerNoticeResult, noticeResult, postListResult});

  return (
    <Flex gap={30}>
      <Flex>
        {posts.map((post, index) => (
          <PostItem
            key={post.id + index.toString()}
            {...post}
            isNowPost={postId === post.id}
          />
        ))}
        {list.length === 0 && <p>작성된 글이 없습니다.</p>}
      </Flex>
      <Pagination lastPage={lastPage} currentPage={currentPage} />
      <AddPost />
    </Flex>
  );
};

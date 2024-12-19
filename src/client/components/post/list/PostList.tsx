import {actionWrapper} from '@/client/action/actionWapper';
import {PostItem} from '@/client/components/post/list/PostItem';
import {Flex} from '@/client/ui/widgets';
import {Pagination} from '@/client/ui/widgets/Pagination';
import {getNoticeList, getPostList} from '@/server/actions/post.actions';

type PostListProps = {
  page: number;
  categoryId?: number;
  subCategoryId?: number;
};
export const PostList = async ({
  page,
  categoryId,
  subCategoryId,
}: PostListProps) => {
  const [genelerNoticeResult, noticeResult, postListResult] = await Promise.all(
    [
      actionWrapper({
        action: getNoticeList,
        options: {revalidate: 1000 * 60 * 60},
      }),
      categoryId ? getNoticeList(categoryId) : {list: []},
      getPostList({page, categoryId, subCategoryId}),
    ],
  );

  const {list: notice} = noticeResult;
  const {page: currentPage, list, lastPage} = postListResult;
  const {list: allNotice} = genelerNoticeResult;

  const posts = [...allNotice, ...notice, ...list];

  return (
    <Flex gap={10}>
      {posts.map((post, index) => (
        <PostItem key={post.id + index.toString()} {...post} />
      ))}
      {list.length === 0 && <p>작성된 글이 없습니다.</p>}
      <Pagination lastPage={lastPage} currentPage={currentPage} />
    </Flex>
  );
};

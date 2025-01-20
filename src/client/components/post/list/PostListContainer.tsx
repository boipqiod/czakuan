import {actionWrapper} from '@/client/action/actionWapper';
import {CategoryTitle} from '@/client/components/post/CategoryTitle';
import {PostList} from '@/client/components/post/list/PostList';
import {Flex} from '@/client/ui/widgets';
import {AlertAndRedirect} from '@/client/ui/widgets/Alert';
import {Pagination} from '@/client/ui/widgets/Pagination';
import {getNoticeList, getPostList} from '@/server/actions/post.actions';

type PostListProps = {
  page: number;
  categoryId?: number;
  subCategoryId?: number;
};
export const PostListContainer = async ({
  page,
  categoryId,
  subCategoryId,
}: PostListProps) => {
  const [genelerNoticeResult, noticeResult, postListResult] = await Promise.all(
    [
      actionWrapper(getNoticeList, {
        options: {revalidate: 1000 * 60},
      }),
      categoryId ? actionWrapper(() => getNoticeList(categoryId)) : {list: []},
      actionWrapper(() => getPostList({page, categoryId, subCategoryId})),
    ],
  );

  if (postListResult === undefined) {
    return (
      <AlertAndRedirect
        message={'게시글을 불러오는 중 오류가 발생했습니다.'}
        to={'/'}
      />
    );
  }

  const {list: notice} = noticeResult ?? {list: []};
  const {list: allNotice} = genelerNoticeResult ?? {list: []};
  const {list: postList, lastPage, page: currentPage} = postListResult;

  const noticeList = [...allNotice, ...notice];

  return (
    <Flex>
      <section>
        <CategoryTitle />
      </section>
      <section>
        <PostList posts={noticeList} isShowNoPost />
        <PostList posts={postList} />
        <Pagination lastPage={lastPage} currentPage={currentPage} />
      </section>
    </Flex>
  );
};

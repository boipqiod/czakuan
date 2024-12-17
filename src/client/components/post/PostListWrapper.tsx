import styles from '@/assets/styles/components/post/post.module.css';
import {CategoryTitle} from '@/client/components/post/CategoryTitle';
import {PostList} from '@/client/components/post/PostList';
import {Pagination} from '@/client/ui/widgets/Pagination';
import {getNoticeList, getPostList} from '@/server/actions/post.actions';

type PostListWrapperProps = {
  page?: number;
  categoryId?: number;
  subCategoryId?: number;
};
export const PostListWrapper = async ({
  page,
  categoryId,
  subCategoryId,
}: PostListWrapperProps) => {
  const [noticeResult, postListResult] = await Promise.all([
    getNoticeList(categoryId),
    getPostList({page, categoryId, subCategoryId}),
  ]);

  const {list: notice} = noticeResult;
  const {total, page: currentPage, list} = postListResult;

  return (
    <div className={styles.postListWrapper}>
      <section className={styles.title}>
        <CategoryTitle categoryId={categoryId} subCategoryId={subCategoryId} />
      </section>
      <PostList posts={[...notice, ...list]} />
      <Pagination totalPage={total} currentPage={currentPage} />
    </div>
  );
};

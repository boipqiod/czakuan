import styles from '@/assets/styles/components/post/post.module.css';
import {PostListContainer} from '@/client/components/post/list/PostListContainer';
import {PageQeuryProps} from '@/types/common';

const PoppularPostsPage = async ({
  searchParams,
}: PageQeuryProps<{
  page?: string;
  categoryId?: string;
  subCategoryId?: string;
}>) => {
  const query = await searchParams;
  const {
    page: _page,
    categoryId: _categoryId,
    subCategoryId: _subCategoryId,
  } = query;
  const page = Number(_page || 1);
  const categoryId = _categoryId ? Number(_categoryId) : undefined;
  const subCategoryId = _subCategoryId ? Number(_subCategoryId) : undefined;

  return (
    <div className={styles.postListWrapper}>
      <PostListContainer
        page={page}
        categoryId={undefined}
        subCategoryId={undefined}
      />
    </div>
  );
};

export default PoppularPostsPage;

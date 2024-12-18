import styles from '@/assets/styles/components/post/post.module.css';
import {CategoryTitle} from '@/client/components/post/CategoryTitle';
import {PostList} from '@/client/components/post/list/PostList';
import {PageQeuryProps} from '@/types/common';

const Home = async ({
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
      <section className={styles.title}>
        <CategoryTitle categoryId={categoryId} subCategoryId={subCategoryId} />
      </section>
      <PostList
        page={page}
        categoryId={categoryId}
        subCategoryId={subCategoryId}
      />
    </div>
  );
};

export default Home;

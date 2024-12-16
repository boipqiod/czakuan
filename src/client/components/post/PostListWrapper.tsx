import styles from '@/assets/styles/components/post/post.module.css';
import {CategoryTitle} from '@/client/components/post/CategoryTitle';
import {PostList} from '@/client/components/post/PostList';
import {getPostList} from '@/server/actions/post.actions';

type PostListWrapperProps = {
  categoryId?: number;
  subCategoryId?: number;
};
export const PostListWrapper = async ({
  categoryId,
  subCategoryId,
}: PostListWrapperProps) => {
  const {list} = await getPostList({
    categoryId,
    subCategoryId,
  });

  return (
    <div className={styles.postListWrapper}>
      <section className={styles.title}>
        <CategoryTitle categoryId={categoryId} />
      </section>
      <PostList posts={list} />
    </div>
  );
};

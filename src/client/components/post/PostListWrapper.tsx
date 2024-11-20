import styles from '@/assets/styles/components/post/post.module.css';
import {PostList} from '@/client/components/post/PostList';
import {getPostList} from '@/server/actions/post.actions';

export const PostListWrapper = async () => {
  const {list} = await getPostList();

  return (
    <div className={styles.postListWrapper}>
      <section className={styles.title}>
        <h2>게시판 제목123</h2>
      </section>
      <PostList posts={list} />
    </div>
  );
};

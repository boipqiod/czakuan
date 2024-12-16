import {PostListWrapper} from '@/client/components/post/PostListWrapper';
import {PageQeuryProps} from '@/types/common';

const Home = async ({
  searchParams,
}: PageQeuryProps<{
  categoryId?: string;
  subCategoryId?: string;
}>) => {
  const query = await searchParams;

  return (
    <PostListWrapper
      categoryId={query.categoryId ? Number(query.categoryId) : undefined}
      subCategoryId={
        query.subCategoryId ? Number(query.subCategoryId) : undefined
      }
    />
  );
};

export default Home;

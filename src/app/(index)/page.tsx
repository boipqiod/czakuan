import {PostListWrapper} from '@/client/components/post/PostListWrapper';
import {PageQeuryProps} from '@/types/common';

const Home = async ({
  searchParams,
}: PageQeuryProps<{
  page?: string;
  categoryId?: string;
  subCategoryId?: string;
}>) => {
  const query = await searchParams;

  return (
    <PostListWrapper
      page={query.page ? Number(query.page) : undefined}
      categoryId={query.categoryId ? Number(query.categoryId) : undefined}
      subCategoryId={
        query.subCategoryId ? Number(query.subCategoryId) : undefined
      }
    />
  );
};

export default Home;

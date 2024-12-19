import {PostDetail} from '@/client/components/post/detail/PostDetail';
import {PostList} from '@/client/components/post/list/PostList';
import {Flex} from '@/client/ui/widgets';
import {getPostDetail} from '@/server/actions/post.actions';
import {getCommentList} from '@/server/actions/post.comment.actions';
import {PageProps} from '@/types/common';

const PostDetailPage = async ({
  params,
  searchParams,
}: PageProps<
  {id: string},
  {page?: string; categoryId?: string; subCategoryId?: string}
>) => {
  const {id} = await params;
  const {page, categoryId, subCategoryId} = await searchParams;

  const [post, commentReulst] = await Promise.all([
    getPostDetail(Number(id)),
    getCommentList(Number(id), 1),
  ]);

  if (!post || !commentReulst) {
    return <div>Post not found</div>;
  }
  return (
    <Flex gap={30} width={'100%'}>
      <PostDetail post={post} commentRelust={commentReulst} />
      <PostList
        page={Number(page ?? 1)}
        categoryId={categoryId ? Number(categoryId) : undefined}
        subCategoryId={subCategoryId ? Number(subCategoryId) : undefined}
      />
    </Flex>
  );
};

export default PostDetailPage;

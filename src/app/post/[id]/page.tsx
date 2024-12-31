import {actionWrapper} from '@/client/action/actionWapper';
import {PostDetail} from '@/client/components/post/detail/PostDetail';
import {PostList} from '@/client/components/post/list/PostList';
import {Flex} from '@/client/ui/widgets';
import {getPostDetail} from '@/server/actions/post.actions';
import {getCommentList} from '@/server/actions/post.comment.actions';
import {PageProps} from '@/types/common';

export async function generateMetadata({params}: {params: {id: string}}) {
  // 메타데이터 전용 요청
  const post = await actionWrapper(() => getPostDetail(Number(params.id)));
  return {
    title: '에대숲 :: ' + (post?.title ?? ''),
  };
}

const PostDetailPage = async ({
  params,
  searchParams,
}: PageProps<
  {id: string},
  {page?: string; categoryId?: string; subCategoryId?: string}
>) => {
  const {id} = await params;
  const {page, categoryId, subCategoryId} = await searchParams;

  const [post, commentResult] = await Promise.all([
    actionWrapper(() => getPostDetail(Number(id))),
    actionWrapper(() => getCommentList(Number(id))),
  ]);

  if (!post || !commentResult) {
    return <div>Post not found</div>;
  }
  return (
    <Flex gap={30} width={'100%'}>
      <PostDetail post={post} commentResult={commentResult} />
      <Flex marginBottom={30}>
        <PostList
          page={Number(page ?? 1)}
          categoryId={categoryId ? Number(categoryId) : undefined}
          subCategoryId={subCategoryId ? Number(subCategoryId) : undefined}
          postId={post.id}
        />
      </Flex>
    </Flex>
  );
};

export default PostDetailPage;

import {actionWrapper} from '@/client/action/actionWapper';
import {PostModify} from '@/client/components/post/modify/PostModify';
import {getPostDetail} from '@/server/actions/post.actions';
import {PagePathProps} from '@/types/common';

const PostModifyPage = async ({params}: PagePathProps<{id: string}>) => {
  const {id} = await params;
  const post = await actionWrapper(() => getPostDetail(Number(id)));

  if (!post) {
    return <div>Post not found</div>;
  }

  return <PostModify post={post} />;
};

export default PostModifyPage;

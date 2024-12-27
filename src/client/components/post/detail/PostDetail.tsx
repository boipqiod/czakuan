'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {CommentItems} from '@/client/components/post/detail/comment/CommentItems';
import {PostAuthor} from '@/client/components/post/detail/PostAuthor';
import {PostContent} from '@/client/components/post/detail/PostContent';
import {PostLike} from '@/client/components/post/detail/PostLike';
import {useAuthStore} from '@/client/store/AuthStore';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  Flex,
  HFlex,
} from '@/client/ui/widgets';
import {Divider} from '@/client/ui/widgets/Divider';
import {deletePost, reportPost} from '@/server/actions/post.actions';
import {CommentResultType, PostDetailType} from '@/types/post';
import {useRouter} from 'next/navigation';
import {IoIosMore} from 'react-icons/io';

type PostDetailProps = {
  post: PostDetailType;
  commentResult: CommentResultType;
};
export const PostDetail = ({post, commentResult}: PostDetailProps) => {
  const {isLogin, user} = useAuthStore();
  const router = useRouter();

  const handleDelete = () => {
    const isDelete = confirm('정말 삭제하시겠습니까?');
    if (!isDelete) return;

    actionWrapper(() => deletePost(post.id), {
      success: () => {
        alert('삭제되었습니다.');
        router.back();
      },
      error: error => {
        alert(error.statusText);
      },
    });
  };

  const handleReport = () => {
    if (!isLogin || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const reason = prompt('신고 사유를 입력해주세요.');
    if (!reason) return;
    if (reason && reason.length < 5) {
      alert('신고 사유는 5자 이상 입력해주세요.');
      return;
    }

    actionWrapper(() => reportPost(post.id, user.id, reason), {
      success: () => {
        alert('신고가 완료되었습니다.');
      },
      error: error => {
        alert(error.statusText);
      },
    });
  };

  return (
    <Flex minWidth={'100%'}>
      {/* title */}
      <section>
        <HFlex justifyContent={'space-between'} alignItems={'center'}>
          <h1>{post.title}</h1>

          <DropdownMenu isRight>
            <DropdownMenuButton>
              <IoIosMore color={'white'} size={'1.5rem'} />
            </DropdownMenuButton>
            {user?.id === post.author.id && (
              <DropdownMenuItem onClick={handleDelete}>삭제</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleReport}>신고</DropdownMenuItem>
          </DropdownMenu>
        </HFlex>
        <Divider marginBottom={10} />
        <PostAuthor post={post} />
      </section>
      {/* content */}
      <section>
        <PostContent content={post.content} />
        <PostLike post={post} />
        <Divider marginY={10} />
      </section>
      <section>
        <h3>댓글</h3>
        <CommentItems post={post} commentResult={commentResult} />
      </section>
    </Flex>
  );
};

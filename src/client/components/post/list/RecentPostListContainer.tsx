import {actionWrapper} from '@/client/action/actionWapper';
import {CategoryTitle} from '@/client/components/post/CategoryTitle';
import {PostList} from '@/client/components/post/list/PostList';
import {Flex} from '@/client/ui/widgets';
import {AlertAndRedirect} from '@/client/ui/widgets/Alert';
import {getRecentPostList} from '@/server/actions/post.actions';

export const RecentPostListContainer = async () => {
  const lists = await actionWrapper(() => getRecentPostList());

  if (!lists)
    return (
      <AlertAndRedirect message="게시글을 불러오는데 실패했습니다." to="/" />
    );

  return (
    <Flex margin={'2rem 0'}>
      <CategoryTitle />
      {lists.map(data => {
        return (
          <div key={data.category.id}>
            <CategoryTitle title={data.category.name} isSmall />
            <PostList posts={data.list} />
          </div>
        );
      })}
    </Flex>
  );
};

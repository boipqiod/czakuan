import {actionWrapper} from '@/client/action/actionWapper';
import {CategoryTitle} from '@/client/components/post/CategoryTitle';
import {PostList} from '@/client/components/post/list/PostList';
import {Flex} from '@/client/ui/widgets';
import {AlertAndRedirect} from '@/client/ui/widgets/Alert';
import {getNoticeList, getRecentPostList} from '@/server/actions/post.actions';

export const RecentPostListContainer = async () => {
  const [notice, lists] = await Promise.all([
    actionWrapper(() => getNoticeList()),
    actionWrapper(() => getRecentPostList()),
  ]);

  if (!lists)
    return (
      <AlertAndRedirect message="게시글을 불러오는데 실패했습니다." to="/" />
    );

  return (
    <Flex marginBottom={'2rem'}>
      <CategoryTitle />
      <Flex gap={'1rem'} flexDirection={'column'}>
        {notice && <PostList posts={notice.list} />}
        {lists.map(data => {
          return (
            <div key={data.category.id}>
              <CategoryTitle title={data.category.name} isSmall />
              <PostList posts={data.list} />
            </div>
          );
        })}
      </Flex>
    </Flex>
  );
};

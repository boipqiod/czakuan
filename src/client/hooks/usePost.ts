import {actionWrapper} from '@/client/action/actionWapper';
import {increaseViewCountPost} from '@/server/actions/post.actions';
import {useEffect} from 'react';

const VIEW_INCREASE_KEY = '_pvi';

export const usePostView = (postId: number) => {
  const checkViewIncrease = (id: number) => {
    const viewIncreaseIdsString = sessionStorage.getItem(VIEW_INCREASE_KEY);
    const viewIncreaseIds = JSON.parse(viewIncreaseIdsString ?? '[]');
    return viewIncreaseIds.includes(id);
  };

  const setViewIncrease = (id: number) => {
    const viewIncreaseIdsString = sessionStorage.getItem(VIEW_INCREASE_KEY);
    const viewIncreaseIds = JSON.parse(viewIncreaseIdsString ?? '[]');
    viewIncreaseIds.push(id);
    sessionStorage.setItem(VIEW_INCREASE_KEY, JSON.stringify(viewIncreaseIds));
  };

  useEffect(() => {
    if (postId === 0) return;
    if (checkViewIncrease(postId)) return;

    actionWrapper(() => increaseViewCountPost(postId), {
      success: () => {
        setViewIncrease(postId);
      },
    });
  }, [postId]);
};

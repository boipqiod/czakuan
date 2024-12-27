import {actionWrapper} from '@/client/action/actionWapper';
import {increaseViewCountPost} from '@/server/actions/post.actions';
import {useEffect} from 'react';

const VIEW_INCREASE_KEY = '_pvi';
export const checkViewPost = (id: number) => {
  const viewIncreaseIdsString = sessionStorage.getItem(VIEW_INCREASE_KEY);
  const viewIncreaseIds = JSON.parse(viewIncreaseIdsString ?? '[]');
  return viewIncreaseIds.includes(id);
};

export const setViewPost = (id: number) => {
  const viewIncreaseIdsString = sessionStorage.getItem(VIEW_INCREASE_KEY);
  const viewIncreaseIds = JSON.parse(viewIncreaseIdsString ?? '[]');
  viewIncreaseIds.push(id);
  sessionStorage.setItem(VIEW_INCREASE_KEY, JSON.stringify(viewIncreaseIds));
};

export const usePostViewIncrease = (postId: number) => {
  useEffect(() => {
    if (postId === 0) return;
    if (checkViewPost(postId)) return;

    actionWrapper(() => increaseViewCountPost(postId), {
      success: () => {
        setViewPost(postId);
      },
    });
  }, [postId]);
};

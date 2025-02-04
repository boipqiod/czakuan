'use client';
import {useAuthStore} from '@/client/store/AuthStore';
import {PostDetailType} from '@/types/post';
import {useEffect} from 'react';

type PostModifyProps = {
  post: PostDetailType;
};

export const PostModify = ({post}: PostModifyProps) => {
  const {isLogin, user} = useAuthStore();

  useEffect(() => {
    if (!isLogin || !user || user.id !== post.author.id) {
      alert('권한이 없습니다.');
      window.history.back();
    }
  }, []);

  return <div>PostModify</div>;
};

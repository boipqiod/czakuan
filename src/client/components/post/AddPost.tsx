'use client';
import {useAuthStore} from '@/client/store/AuthStore';
import {Button} from '@/client/ui/widgets/Button';
import {useRouter} from 'next/navigation';

export const AddPost = () => {
  const router = useRouter();
  const {isLogin} = useAuthStore();

  const handleAddPost = () => {
    console.log('handleAddPost');

    if (!isLogin) {
      alert('로그인이 필요합니다.');
      return;
    }
    router.push('/post/create');
  };

  return <Button onClick={handleAddPost}>글쓰기</Button>;
};

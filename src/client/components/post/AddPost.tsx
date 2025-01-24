'use client';
import {useQueryParams} from '@/client/hooks/useNavigate';
import {useAuthStore} from '@/client/store/AuthStore';
import {Button} from '@/client/ui/widgets/Button';

export const AddPost = () => {
  const {toPathWithQuery} = useQueryParams();
  const {isLogin} = useAuthStore();

  const handleAddPost = () => {
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      return;
    }
    toPathWithQuery('/post/create');
  };

  return <Button onClick={handleAddPost}>글쓰기</Button>;
};

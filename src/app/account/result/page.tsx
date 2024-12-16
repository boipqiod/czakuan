'use client';
import {KakaoLoginMetaData} from '@/client/hooks/useKakao';
import {useAuthStore} from '@/client/store/AuthStore';
import {Flex} from '@/client/ui/widgets';
import {actionWrapper} from '@/lib/actions';
import {
  kakaoLogin,
  login,
  register,
  saveUserInfo,
} from '@/server/actions/auth.actions';
import {User} from '@/types/user';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

const LoginResult = () => {
  const router = useRouter();
  const {login: loginStore} = useAuthStore();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        alert('정보가 올바르지 않습니다.');
        router.replace('/');
        return;
      }

      const metaData = JSON.parse(
        decodeURIComponent(state),
      ) as KakaoLoginMetaData;

      const {id} = await actionWrapper(kakaoLogin(code));

      let user: User;
      if (metaData.type === 'login') {
        console.log('login', id);

        user = await actionWrapper(login(id));
      } else {
        if (!metaData.nickName) {
          alert('정보가 올바르지 않습니다.');
          router.replace('/');
          return;
        }
        user = await actionWrapper(register(id, metaData.nickName));
      }

      if (!user) {
        alert('로그인에 실패했습니다.');
        router.replace('/');
        return;
      }

      loginStore(user);
      await actionWrapper(saveUserInfo(user, true));
      router.replace('/');
    } catch (e) {
      console.error(e);
      alert('로그인에 실패했습니다.');
      router.replace('/');
    }
  };

  return (
    <Flex>
      <h3>로그인 처리 중입니다. 잠시만 기다려주세요...</h3>
    </Flex>
  );
};

export default LoginResult;

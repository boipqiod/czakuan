'use client';
import {KakaoLoginMetaData} from '@/client/hooks/useKakao';
import {Flex} from '@/client/ui/widgets';
import {
  kakaoLogin,
  login,
  register,
  saveUserInfo,
} from '@/server/actions/auth.actions';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

const LoginResult = () => {
  const router = useRouter();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
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
    const id = await kakaoLogin(code);
    let user;
    if (metaData.type === 'login') {
      user = await login(id);
    } else {
      if (!metaData.nickName) {
        alert('정보가 올바르지 않습니다.');
        router.replace('/');
        return;
      }
      user = await register(id, metaData.nickName);
    }

    if (!user) {
      alert('로그인에 실패했습니다.');
      router.replace('/');
      return;
    }

    await saveUserInfo(user, true);
    router.replace('/');
  };

  return (
    <Flex>
      <h1>로그인 처리 중입니다. 잠시만 기다려주세요.</h1>
    </Flex>
  );
};

export default LoginResult;

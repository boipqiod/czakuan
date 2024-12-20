'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {KakaoLoginMetaData} from '@/client/hooks/useKakao';
import {useAuthStore} from '@/client/store/AuthStore';
import {Flex} from '@/client/ui/widgets';
import {
  kakaoLogin as kakaoLoginAction,
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
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    alert('정보가 올바르지 않습니다.');
    router.replace('/');
    return;
  }

  const metaData = JSON.parse(decodeURIComponent(state)) as KakaoLoginMetaData;

  useEffect(() => kakaoLogin(), []);

  const kakaoLogin = () => {
    actionWrapper({
      action: () => kakaoLoginAction(code),
      success: response => {
        if (metaData.type === 'login') {
          loginUser(response.data.id);
        } else {
          createUser(response.data.id);
        }
      },
    });
  };

  const createUser = (kakaoId: number) => {
    const {nickName} = metaData;
    if (!nickName) {
      alert('정보가 올바르지 않습니다.');
      router.replace('/');
      return;
    }

    actionWrapper({
      action: () => register(kakaoId, nickName),
      success: response => setLogin(response.data),
    });
  };

  const loginUser = (kakaoId: number) => {
    actionWrapper({
      action: () => login(kakaoId),
      success: response => setLogin(response.data),
    });
  };

  const setLogin = (user: User) => {
    loginStore(user);
    actionWrapper({
      action: () => saveUserInfo(user, true),
      success: () => {
        router.replace('/');
      },
    });
  };

  return (
    <Flex>
      <h3>로그인 처리 중입니다. 잠시만 기다려주세요...</h3>
    </Flex>
  );
};

export default LoginResult;

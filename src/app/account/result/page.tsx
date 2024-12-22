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
    return <></>;
  }

  const metaData = JSON.parse(decodeURIComponent(state)) as KakaoLoginMetaData;

  useEffect(() => {
    kakaoLogin();
  }, []);

  const kakaoLogin = async () => {
    await actionWrapper(() => kakaoLoginAction(code), {
      success: response => {
        if (metaData.type === 'login') {
          loginUser(response.data.id);
        } else {
          createUser(response.data.id);
        }
      },
      error: err => {
        console.log(err);
        alert('로그인 중 오류가 발생했습니다.1111');
        router.replace('/');
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

    actionWrapper(() => register(kakaoId, nickName), {
      success: response => setLogin(response.data),
      error: err => {
        if (err.status === 400) {
          alert('이미 존재하는 닉네임입니다. 다른 닉네임을 입력해주세요.');
          router.back();
          return;
        } else if (err.status === 409) {
          alert('이미 가입된 사용자입니다. 로그인을 진행해주세요.');
          router.replace('/account/login');
          return;
        }
      },
    });
  };

  const loginUser = (kakaoId: number) => {
    actionWrapper(() => login(kakaoId), {
      success: response => setLogin(response.data),
      error: err => {
        console.log(err);
        if (err.status === 404) {
          alert('가입되지 않은 사용자입니다. 회원가입을 진행해주세요.');
          router.replace('/account/register');
          return;
        } else {
          alert('로그인 중 오류가 발생했습니다.');
          router.replace('/');
          return;
        }
      },
    });
  };

  const setLogin = (user: User) => {
    loginStore(user);
    actionWrapper(() => saveUserInfo(user, true), {
      success: () => {
        router.replace('/');
      },
    });
  };

  return (
    <Flex>
      <h5>로그인 처리 중입니다. 잠시만 기다려주세요...</h5>
    </Flex>
  );
};

export default LoginResult;

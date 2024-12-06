'use client';

import {useEffect} from 'react';

const client_id = '06d84dded26abc302eb7ea2073a3e183';
declare global {
  interface Window {
    Kakao: any;
  }
}

const LoginPage = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    document.body.appendChild(script);
    script.onload = () => {
      initKakao();
    };
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initKakao = () => {
    if (!window.Kakao) {
      console.log('Kakao SDK를 불러오는 중입니다.');
      setTimeout(initKakao, 100);
    }

    try {
      window.Kakao.isInitialized();
      window.Kakao.init(client_id);
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmit = async () => {
    const redirect_uri = `${window.origin}/account/result`;
    console.log(window.Kakao);

    window.Kakao.Auth.authorize({
      redirectUri: redirect_uri,
    });
  };
  return <button onClick={onSubmit}>test</button>;
};

export default LoginPage;

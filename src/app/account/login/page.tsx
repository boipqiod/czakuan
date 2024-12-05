'use client';

import {useEffect} from 'react';

const client_id = 'c723e95c03ebe2af922410a3e2e493f4';
declare global {
  interface Window {
    Kakao: any;
  }
}

const LoginPage = () => {
  useEffect(() => {
    try {
      window.Kakao.isInitialized();
      window.Kakao.init(client_id);
    } catch (e) {
      console.log(e);
    }
  }, []);

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

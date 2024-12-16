'use client';
import {useAuthStore} from '@/client/store/AuthStore';
import {Content} from '@/client/ui/layouts/Content';
import {Footer} from '@/client/ui/layouts/Footer';
import {Header} from '@/client/ui/layouts/Header';
import {actionWrapper} from '@/lib/actions';
import {getUserInfo} from '@/server/actions/user.actions';
import {ReactNode, useEffect, useState} from 'react';

type LayoutProps = {
  children: ReactNode;
};
export const Layout = ({children}: LayoutProps) => {
  const {user, isLogin, login} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      console.log('### fetchUserInfo', {isLogin, user});

      if (isLogin) {
        return;
      }

      const userInfo = await actionWrapper(getUserInfo());
      console.log('### userInfo', userInfo);

      if (!userInfo) {
        return;
      }

      login(userInfo);
    };

    fetchUserInfo().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header user={user ?? undefined} />
      <Content>{children}</Content>
      <Footer />
    </>
  );
};

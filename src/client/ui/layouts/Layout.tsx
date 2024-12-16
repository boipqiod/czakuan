'use client';
import {useAuthStore} from '@/client/store/AuthStore';
import {Content} from '@/client/ui/layouts/Content';
import {Footer} from '@/client/ui/layouts/Footer';
import {Header} from '@/client/ui/layouts/Header';
import {SidePanel} from '@/client/ui/layouts/SidePanel';
import {actionWrapper} from '@/lib/actions';
import {getUserInfo} from '@/server/actions/user.actions';
import {ReactNode, useEffect, useState} from 'react';

type LayoutProps = {
  children: ReactNode;
};
export const Layout = ({children}: LayoutProps) => {
  const {user, isLogin, setUserInfo} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLogin) return;

      const userInfo = await actionWrapper(getUserInfo());
      if (!userInfo) return;

      setUserInfo(userInfo);
    };

    fetchUserInfo().finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return null;

  return (
    <>
      <Header />
      <Content>
        <SidePanel />
        {children}
      </Content>
      <Footer />
    </>
  );
};

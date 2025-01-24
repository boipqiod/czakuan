'use client';
import {actionWrapper} from '@/client/action/actionWapper';
import {useAuthStore} from '@/client/store/AuthStore';
import {Content} from '@/client/ui/layouts/Content';
import {Footer} from '@/client/ui/layouts/Footer';
import {Header} from '@/client/ui/layouts/Header';
import {SidePanel} from '@/client/ui/layouts/SidePanel';
import {SidePanel as AdminSidePanel} from '@/client/ui/layouts/admin/SidePanel';
import {getMyInfo} from '@/server/actions/user.actions';
import {getAnalytics} from 'firebase/analytics';
import {initializeApp} from 'firebase/app';
import {usePathname} from 'next/navigation';
import {ReactNode, useEffect, useState} from 'react';

type LayoutProps = {
  children: ReactNode;
};
const firebaseConfig = {
  apiKey: 'AIzaSyCaUK-Ps0LcGlrLCeNWKB0jbcpKrGOmzVk',
  authDomain: 'czakuan-df076.firebaseapp.com',
  projectId: 'czakuan-df076',
  storageBucket: 'czakuan-df076.firebasestorage.app',
  messagingSenderId: '97362793494',
  appId: '1:97362793494:web:b37ab6afab977b16d09137',
  measurementId: 'G-DB5B1CF1SG',
};

export const Layout = ({children}: LayoutProps) => {
  const path = usePathname();
  const {isLogin, setUserInfo} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const isAdminLayout = path.startsWith('/admin');

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLogin) return;

      const userInfo = await actionWrapper(getMyInfo, {
        error: error => {
          console.error('### 사용자 정보 조회 실패', error);
          if (error.status === 401) {
            alert('로그라웃 되엉씁니다');
          }
        },
      });
      if (!userInfo) return;

      setUserInfo(userInfo);
    };

    const setFirebase = async () => {
      const app = initializeApp(firebaseConfig);
      getAnalytics(app);
    };

    fetchUserInfo().finally(() => setIsLoading(false));
    if (process.env.NEXT_PUBLIC_FLAG === 'production') setFirebase();
  }, []);

  if (isLoading) return null;
  if (isAdminLayout)
    return (
      <>
        <Header />
        <Content>
          <AdminSidePanel />
          {children}
        </Content>
        <Footer />
      </>
    );

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

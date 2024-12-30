'use client';
import {colors} from '@/assets/color';
import {actionWrapper} from '@/client/action/actionWapper';
import {useAuthStore} from '@/client/store/AuthStore';
import {Content} from '@/client/ui/layouts/Content';
import {Footer} from '@/client/ui/layouts/Footer';
import {Header} from '@/client/ui/layouts/Header';
import {SidePanel} from '@/client/ui/layouts/SidePanel';
import {Flex} from '@/client/ui/widgets';
import {ClearButton} from '@/client/ui/widgets/Button';
import {getMyInfo} from '@/server/actions/user.actions';
import {getAnalytics} from 'firebase/analytics';
import {initializeApp} from 'firebase/app';
import {useRouter} from 'next/navigation';
import {ReactNode, useEffect, useState} from 'react';
import {IoIosAddCircle} from 'react-icons/io';

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
  const {user, isLogin, setUserInfo} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const aa: {isCom: boolean}[] = [];

  aa.filter(a => a.isCom);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLogin) return;

      const userInfo = await actionWrapper(getMyInfo, {
        error: error => {
          console.error('### 사용자 정보 조회 실패', error);
          if (error.status === 401) {
            alert('로그라웃 되엉씁니다');
            window.location.href = '/login';
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
    setFirebase();
  }, []);

  if (isLoading) return null;

  return (
    <>
      <Header />
      <Content>
        <SidePanel />
        <AddPost />
        {children}
      </Content>
      <Footer />
    </>
  );
};

const AddPost = () => {
  const router = useRouter();
  const {isLogin} = useAuthStore();
  if (!isLogin) return null;

  return (
    <Flex position={'absolute'} right={'5%'} bottom={40} zIndex={2}>
      <ClearButton onClick={() => router.push('/post/create')}>
        <IoIosAddCircle color={colors.primary} size={50} />
      </ClearButton>
    </Flex>
  );
};

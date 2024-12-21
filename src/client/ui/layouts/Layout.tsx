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
import {useRouter} from 'next/navigation';
import {ReactNode, useEffect, useState} from 'react';
import {IoIosAddCircle} from 'react-icons/io';

type LayoutProps = {
  children: ReactNode;
};
export const Layout = ({children}: LayoutProps) => {
  const {user, isLogin, setUserInfo} = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (isLogin) return;

      const userInfo = await actionWrapper({
        action: getMyInfo,
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

    fetchUserInfo().finally(() => setIsLoading(false));
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

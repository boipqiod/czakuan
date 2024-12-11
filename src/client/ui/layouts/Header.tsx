'use client';
import logo from '@/assets/image/logo.png';
import styles from '@/assets/styles/layouts/header.module.css';
import {useAuthStore} from '@/client/store/AuthStore';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Avatar} from '@/client/ui/widgets/Avatar';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
} from '@/client/ui/widgets/DropdownMenu';
import {logout as logoutAction} from '@/server/actions/auth.actions';
import {User} from '@/types/user';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {TiThMenu} from 'react-icons/ti';

type HeaderProps = {
  user?: User;
};
export const Header = ({user: loginUser}: Readonly<HeaderProps>) => {
  const {toggleSidebar} = useLayoutStore();
  const {user, isLogin, login, logout} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loginUser) login(loginUser);
  }, [loginUser, isLogin]);

  const onLogout = async () => {
    logoutAction();
    logout();
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <button className={styles['menu-button']} onClick={toggleSidebar}>
        <TiThMenu fontSize={25} color={'white'} />
      </button>
      <Link href={'/'} className={styles.logo}>
        <Image height={40} src={logo} alt={'logo'} />
      </Link>
      <DropdownMenu>
        <DropdownMenuButton>
          <Avatar
            alt={'avatar'}
            size={15}
            src={user?.profileImageUrl}
            style={{padding: '5px'}}
          />
        </DropdownMenuButton>
        {isLogin && (
          <DropdownMenuItem onClick={() => router.push('/user')}>
            내 정보
          </DropdownMenuItem>
        )}
        {isLogin && (
          <DropdownMenuItem onClick={onLogout}>로그아웃</DropdownMenuItem>
        )}
        {!isLogin && (
          <DropdownMenuItem onClick={() => router.push('/account/register')}>
            회원가입
          </DropdownMenuItem>
        )}
        {!isLogin && (
          <DropdownMenuItem onClick={() => router.push('/account/login')}>
            로그인
          </DropdownMenuItem>
        )}
      </DropdownMenu>
    </header>
  );
};

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
  DropdownMenuLink,
} from '@/client/ui/widgets/DropdownMenu';
import {User} from '@/types/user';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect} from 'react';
import {TiThMenu} from 'react-icons/ti';

type HeaderProps = {
  user?: User;
};
export const Header = ({user: loginUser}: Readonly<HeaderProps>) => {
  const {toggleSidebar} = useLayoutStore();
  const {user, isLogin, login} = useAuthStore();

  useEffect(() => {
    if (loginUser) login(loginUser);
  }, [loginUser]);

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
          <Avatar alt={'avatar'} size={15} src={user?.profileImageUrl} />
        </DropdownMenuButton>
        {isLogin && <DropdownMenuItem>내 정보</DropdownMenuItem>}
        {isLogin && <DropdownMenuItem>로그아웃</DropdownMenuItem>}

        <DropdownMenuLink href={'/account/register'}>회원가입</DropdownMenuLink>
        <DropdownMenuLink href={'/account/login'}>로그인</DropdownMenuLink>
      </DropdownMenu>
    </header>
  );
};

'use client';
import logo from '@/assets/image/logo.png';
import styles from '@/assets/styles/layouts/header.module.css';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Avatar} from '@/client/ui/widgets/Avatar';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuLink,
} from '@/client/ui/widgets/DropdownMenu';
import Image from 'next/image';
import Link from 'next/link';
import {TiThMenu} from 'react-icons/ti';

export const Header = () => {
  const {toggleSidebar} = useLayoutStore();

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
          <Avatar alt={'avatar'} size={15} />
        </DropdownMenuButton>
        <DropdownMenuLink href={'/account/login'}>로그인</DropdownMenuLink>
        <DropdownMenuItem>로그아웃</DropdownMenuItem>
      </DropdownMenu>
    </header>
  );
};

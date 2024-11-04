'use client';
import {useLayoutStore} from '@/client/store/LayoutStore';
import {Avatar} from '@/client/ui/widgets/Avatar';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
} from '@/client/ui/widgets/DropdownMenu';
import Image from 'next/image';
import {TiThMenu} from 'react-icons/ti';
import logo from '../../../assets/image/logo.png';
import styles from './header.module.css';

export const Header = () => {
  const {toggleSidebar} = useLayoutStore();
  const reload = () => {
    window.location.reload();
  };

  return (
    <header className={styles.header}>
      <button className={styles['menu-button']} onClick={toggleSidebar}>
        <TiThMenu fontSize={25} color={'white'} />
      </button>
      <button className={styles.logo} onClick={reload}>
        <Image height={45} src={logo} alt={'logo'} />
      </button>
      <DropdownMenu>
        <DropdownMenuButton>
          <Avatar alt={'avatar'} size={15} />
        </DropdownMenuButton>
        <DropdownMenuItem>로그인</DropdownMenuItem>
        <DropdownMenuItem>로그아웃</DropdownMenuItem>
      </DropdownMenu>
    </header>
  );
};

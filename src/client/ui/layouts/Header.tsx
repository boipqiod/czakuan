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
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {TiThMenu} from 'react-icons/ti';

export const Header = () => {
  const {toggleSidebar} = useLayoutStore();
  const {user, isLogin, logout} = useAuthStore();
  const router = useRouter();

  const onLogout = async () => {
    const confirm = window.confirm('로그아웃 하시겠습니까?');
    if (!confirm) return;

    logoutAction();
    logout();
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <button className={styles['menu-button']} onClick={toggleSidebar}>
        <TiThMenu fontSize={25} color={'white'} />
      </button>
      <Link href={'/'} className={styles.logo}>
        <Image height={40} src={logo} alt={'logo'} />
      </Link>
      <DropdownMenu isRight>
        <DropdownMenuButton>
          <Avatar alt={'avatar'} size={25} src={user?.profileImageUrl} />
        </DropdownMenuButton>
        {isLogin && (
          <DropdownMenuItem onClick={() => router.push('/user')}>
            내 정보
          </DropdownMenuItem>
        )}
        {user?.role === 'SUPER_ADMIN' && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            관리자 페이지
          </DropdownMenuItem>
        )}
        {isLogin && (
          <DropdownMenuItem onClick={onLogout}>로그아웃</DropdownMenuItem>
        )}
        {!isLogin && (
          <DropdownMenuItem onClick={() => router.push('/account/login')}>
            로그인
          </DropdownMenuItem>
        )}
        {!isLogin && (
          <DropdownMenuItem onClick={() => router.push('/account/register')}>
            회원가입
          </DropdownMenuItem>
        )}
      </DropdownMenu>
    </header>
  );
};

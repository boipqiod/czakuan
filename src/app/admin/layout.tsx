'use client';
import {useAuthStore} from '@/client/store/AuthStore';
import {useRouter} from 'next/navigation';
import {ReactNode, useEffect} from 'react';

const AdminLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const {isLogin, user} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLogin || user?.role !== 'SUPER_ADMIN') {
      alert('접근 권한이 없습니다.');
      router.replace('/');
    }
  }, []);

  return children;
};

export default AdminLayout;

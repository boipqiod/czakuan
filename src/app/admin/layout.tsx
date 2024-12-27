import {AlertAndRedirect} from '@/client/ui/widgets/Alert';
import {AuthService} from '@/server/service/auth.service';
import {ReactNode} from 'react';

const AdminLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  try {
    new AuthService().verifySuperAdmin();
    return children;
  } catch (error) {
    return <AlertAndRedirect message={'접근 불가능합니다.'} to={'/'} />;
  }
};

export default AdminLayout;

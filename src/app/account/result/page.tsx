import {Flex} from '@/client/ui/widgets';
import kakao from '@/server/modules/kakao';
import UserService from '@/server/service/user.service';
import {PageQeuryProps} from '@/types/common';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {NextResponse} from 'next/server';

const LoginResult = async (data: PageQeuryProps<{code: string}>) => {
  try {
    const service = new UserService();
    const cookieStore = await cookies();

    const {code} = await data.searchParams;
    const token = await kakao.getToken(code);
    const {id} = await kakao.getUserData(token.access_token);
    const user = await service.getUserByKakaoId(id);

    cookieStore.set('user', JSON.stringify(user), {
      httpOnly: true,
    });

    redirect('/');
  } catch (error) {
    if (error instanceof NextResponse) {
      error.status === 404 && redirect('/account/register?to=login');
      return null;
    }

    return (
      <Flex>
        <h1>로그인 실패</h1>
        <p>로그인에 실패하였습니다. 다시 시도해주세요.</p>
        <p>{String(error)}</p>
      </Flex>
    );
  }
};

export default LoginResult;
export const dynamic = 'force-dynamic'; // 페이지를 동적으로 렌더링

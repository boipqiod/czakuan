import {KakaoLoginMetaData} from '@/client/hooks/useKakao';
import {Flex} from '@/client/ui/widgets';
import {AlertAndRedirect} from '@/client/ui/widgets/Alert';
import kakao from '@/server/modules/kakao';
import UserService from '@/server/service/user.service';
import {PageQeuryProps} from '@/types/common';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {NextResponse} from 'next/server';

const LoginResult = async (
  data: PageQeuryProps<{code: string; state: string}>,
) => {
  try {
    const service = new UserService();
    const cookieStore = await cookies();

    const {code, state} = await data.searchParams;

    const stateObj = JSON.parse(
      decodeURIComponent(state),
    ) as KakaoLoginMetaData;

    const token = await kakao.getToken(code);
    const {id} = await kakao.getUserData(token.access_token);

    const {isAutoLogin} = stateObj;

    if (stateObj.type === 'register') {
      const {nickName} = stateObj;
      // 회원가입 진행
      const user = await service.createUser({
        id,
        nickName: nickName as string,
      });

      cookieStore.set('user', JSON.stringify(user), {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
    } else {
      // 로그인 진행
      const user = await service.getUserByKakaoId(id);

      cookieStore.set('user', JSON.stringify(user), {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
    }

    redirect('/');
  } catch (error) {
    if (error instanceof NextResponse && error.status === 404) {
      return (
        <AlertAndRedirect
          message={'아이디를 찾을 수 없습니다. 카카오 계정으로 가입해주세요.'}
          to={'/account/register'}
        />
      );
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

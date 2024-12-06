import {Kakao} from '@/server/modules/kakao';
import {PageQeuryProps} from '@/types/common';

const LoginResult = async (data: PageQeuryProps<{code: string}>) => {
  const {code} = await data.searchParams;
  const kakao = new Kakao();
  const token = await kakao.getToken(code);
  console.log(token);
  const profile = await kakao.getUserData(token.access_token);
  console.log(profile);

  return (
    <div>
      <h1>LoginResult</h1>
    </div>
  );
};

export default LoginResult;

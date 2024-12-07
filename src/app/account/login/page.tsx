'use client';
import kakaoLogin from '@/assets/image/kakao_login_medium_narrow.png';
import {useKakao} from '@/client/hooks/useKakao';
import {Flex, Text} from '@/client/ui/widgets';
import {ImageButton} from '@/client/ui/widgets/Button';
import Link from 'next/link';

const LoginPage = () => {
  const {login} = useKakao();

  return (
    <Flex gap={20}>
      <h1>로그인 페이지</h1>
      <Flex alignItems={'center'}>
        <ImageButton
          width={'200px'}
          onClick={login}
          src={kakaoLogin.src}
          alt={'카카오 로그인'}
        />
      </Flex>
      <Flex alignItems={'center'}>
        <Text padding={'10px'} fontSize={'14px'}>
          카카오 계정으로 로그인하시면 서비스의{' '}
          <Link style={{color: '#979797'}} href={'/terms-of-service'}>
            이용약관
          </Link>{' '}
          및{' '}
          <Link style={{color: '#979797'}} href={'/privacy-policy'}>
            개인정보 처리방침
          </Link>
          에 동의하는 것으로 간주합니다.
        </Text>
        <Link style={{color: '#979797'}} href={'/account/register'}>
          아직 회원이 아니신가요? 회원가입하기
        </Link>
      </Flex>
    </Flex>
  );
};

export default LoginPage;

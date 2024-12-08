'use client';
import kakaoLogin from '@/assets/image/kakao_login_medium_narrow.png';
import {useKakao} from '@/client/hooks/useKakao';
import {Flex, Text} from '@/client/ui/widgets';
import {ImageButton} from '@/client/ui/widgets/Button';
import {Input} from '@/client/ui/widgets/Input';
import Link from 'next/link';
import {useEffect, useState} from 'react';

const RegisterPage = () => {
  const {login} = useKakao();

  const [nickName, setNickname] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const to = searchParams.get('to');
    if (to === 'notfound') {
      alert('아이디를 찾을 수 없습니다. 카카오 계정으로 가입해주세요.');
    }
  }, []);

  const onRegister = () => {
    if (nickName === '') {
      alert('닉네임을 입력해주세요.');
      return;
    }
    login({
      type: 'register',
      nickName,
    });
  };

  const onChange = (value: string) => {
    setNickname(value);
  };

  useEffect(() => {
    sessionStorage.setItem('nickname', nickName);
  }, [nickName]);

  return (
    <Flex gap={20}>
      <h1>회원 가입</h1>
      <Text fontWeight={'bold'}>
        * 닉네임을 입력하고 카카오 계정으로 간편하게 가입하세요.
      </Text>
      <Text>
        닉네임은 다른 사용자에게 보여지는 이름입니다. <br />
        다른 사용자와 겹치지 않는 닉네임을 입력해주세요. <br />
      </Text>
      <Flex>
        <Input value={nickName} onChange={onChange} placeholder={'닉네임'} />
      </Flex>
      <Flex alignItems={'center'}>
        <ImageButton
          width={'200px'}
          onClick={() => {
            onRegister();
          }}
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
        <Link style={{color: '#979797'}} href={'/account/login'}>
          이미 회원이신가요? 로그인하기
        </Link>
      </Flex>
    </Flex>
  );
};

export default RegisterPage;

'use server';
import {serverAction} from '@/lib/actions';
import kakao from '@/server/modules/kakao';
import {TokenService} from '@/server/service/token.service';
import UserService from '@/server/service/user.service';
import {cookies} from 'next/headers';

export const kakaoLogin = await serverAction(async (code: string) => {
  const token = await kakao.getToken(code);
  const {id} = await kakao.getUserData(token.access_token);

  return id;
});

export const register = await serverAction(
  async (kakaoId: number, nickName: string) => {
    const service = new UserService();

    const user = await service.createUser({
      id: kakaoId,
      nickName: nickName as string,
    });

    return user;
  },
);

export const login = serverAction(async (kakaoId: number) => {
  const service = new UserService();

  const user = await service.getUserByKakaoId(kakaoId);

  return user;
});

export const logout = serverAction(async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('refreshToken');
  return null;
});

export const userInfo = serverAction(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const refreshToken = cookieStore.get('refreshToken');

  if (!token || !refreshToken) {
    return null;
  }

  const tokenService = new TokenService();
  try {
    const user = tokenService.verifyAccessToken(token.value);
    return user;
  } catch (e) {
    try {
      const user = tokenService.verifyAccessToken(refreshToken.value);
      const newToken = tokenService.createToken(user, '1h');
      cookieStore.set('token', newToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      });
      return user;
    } catch (e) {
      return null;
    }
  }
});

export const saveUserInfo = serverAction(async (user: any, isSave: boolean) => {
  const cookieStore = await cookies();
  const tokenService = new TokenService();
  const {accessToken, refreshToken} = tokenService.createTokenByUser(user);
  const expires = isSave
    ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    : undefined;
  cookieStore.set('token', accessToken, {
    httpOnly: true,
    expires,
  });
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  return null;
});

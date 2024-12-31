'use server';
import {serverAction} from '@/server/actions/action';
import {setTokens, verifyUser} from '@/server/modules/auth';
import {deleteCookie} from '@/server/modules/cookies';
import kakao from '@/server/modules/kakao';
import TokenService, {
  REFRESH_TOKEN_NAME,
  TOKEN_NAME,
} from '@/server/service/token.service';
import UserService from '@/server/service/user.service';

export const kakaoLogin = async (code: string) =>
  serverAction(async () => {
    const token = await kakao.getToken(code);
    const {id, kakao_account} = await kakao.getUserData(token.access_token);
    return {id, email: kakao_account?.email};
  });

export const register = async (
  kakaoId: number,
  nickName: string,
  email?: string,
) =>
  serverAction(() => {
    return new UserService().createUser({
      id: kakaoId,
      nickName,
      email,
    });
  });

export const login = async (kakaoId: number) =>
  serverAction(() => {
    return new UserService().getUserByKakaoId(kakaoId);
  });

export const logout = async () =>
  serverAction(async () => {
    deleteCookie(TOKEN_NAME);
    deleteCookie(REFRESH_TOKEN_NAME);
    return null;
  });

export const userInfo = async () =>
  serverAction(async () => {
    try {
      return verifyUser();
    } catch (error) {
      return null;
    }
  });

export const saveUserInfo = async (user: any, isSave: boolean) =>
  serverAction(async () => {
    const {accessToken, refreshToken} = new TokenService().createTokenByUser(
      user,
    );
    await setTokens(accessToken, refreshToken);
    return null;
  });

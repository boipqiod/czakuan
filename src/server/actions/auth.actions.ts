'use server';
import {serverAction} from '@/server/actions/action';
import kakao from '@/server/modules/kakao';
import {TokenService} from '@/server/service/token.service';
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
    new TokenService().deleteTokens();
    return null;
  });

export const userInfo = async () =>
  serverAction(async () => {
    try {
      return new TokenService().verifyCookieToken();
    } catch (error) {
      return null;
    }
  });

export const saveUserInfo = async (user: any, isSave: boolean) =>
  serverAction(async () => {
    await new TokenService().saveUserToken(user);
    return null;
  });

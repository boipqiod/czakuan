import {UnauthorizedError} from '@/server/Error';
import {deleteCookie, getCookie, setCookie} from '@/server/modules/cookies';
import TokenService, {
  REFRESH_TOKEN_NAME,
  TOKEN_NAME,
} from '@/server/service/token.service';
import {User} from '@/types/user';
import {cookies} from 'next/headers';

export const verifyUser = async () => {
  const token = await getCookie(TOKEN_NAME);
  const refreshToken = await getCookie(REFRESH_TOKEN_NAME);
  if (!token || !refreshToken) return null;

  const tokenService = new TokenService();

  try {
    return tokenService.verifyToken(token.value) as User;
  } catch {
    const user = tokenService.verifyToken(refreshToken.value) as User;
    if (!user) return null;

    const {accessToken: newAccessToken, refreshToken: newRefreshToken} =
      tokenService.createTokenByUser(user);
    await setCookie(TOKEN_NAME, newAccessToken);
    await setCookie(REFRESH_TOKEN_NAME, newRefreshToken);

    return user;
  }
};

export const verifyUserId = async (userId: number) => {
  const user = await verifyUser();
  if (!user) {
    throw UnauthorizedError();
  }
  if (user.id !== userId) {
    throw UnauthorizedError();
  }
  return user;
};

export const verifyAdmin = async (text?: string) => {
  const user = await verifyUser();
  console.log('verifyAdmin', user);

  if (!user) throw UnauthorizedError(text);
  if (!user.role.includes('ADMIN')) throw UnauthorizedError(text);

  return user;
};

export const verifySuperAdmin = async () => {
  const user = await verifyUser();

  console.log('verifySuperAdmin', user);

  if (!user) {
    throw UnauthorizedError();
  }
  if (!user.role.includes('SUPER_ADMIN')) {
    throw UnauthorizedError();
  }
  return user;
};

export const verifyAdminOrOwner = async (userId: number) => {
  const user = await verifyUser();
  if (!user) {
    throw UnauthorizedError();
  }
  if (!user.role.includes('SUPER_ADMIN') && user.id !== userId) {
    throw UnauthorizedError();
  }
  return user;
};

export const setTokens = async (
  accessToken: string,
  refreshToken: string,
  isSave: boolean,
) => {
  await cookies();
  setCookie(TOKEN_NAME, accessToken, isSave ? 60 * 60 * 24 * 7 : undefined);
  setCookie(
    REFRESH_TOKEN_NAME,
    refreshToken,
    isSave ? 60 * 60 * 24 * 7 : undefined,
  );
};

export const deleteTokens = async () => {
  await cookies();
  deleteCookie(TOKEN_NAME);
  deleteCookie(REFRESH_TOKEN_NAME);
};

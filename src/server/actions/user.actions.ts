'use server';

import {TokenService} from '@/server/service/token.service';
import UserService from '@/server/service/user.service';

export const getMyInfo = async () => {
  const service = new TokenService();
  const userService = new UserService();
  const tokenUser = await service.verifyCookieToken();
  if (!tokenUser) {
    return null;
  }
  const user = await userService.getUser(tokenUser.id);
  return user;
};

export const getUserInfo = async (id: number) => {
  const userService = new UserService();
  const user = await userService.getUser(id);
  return user;
};

export const changeUserInfo = async ({
  nickName,
  profileImage,
}: {
  nickName?: string;
  profileImage?: File;
}) => {
  console.log('### changeUserInfo', {nickName, profileImage});

  const service = new TokenService();
  const userService = new UserService();
  const tokenUser = await service.verifyCookieToken();
  if (!tokenUser) {
    throw new Error('로그인이 필요합니다.');
  }

  const {id} = tokenUser;

  const {url} = profileImage
    ? await userService.uploadTempImage(profileImage)
    : {url: undefined};

  const user = await userService.updateUser(id, nickName, url);

  return user;
};

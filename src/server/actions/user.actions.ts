'use server';

import {serverAction} from '@/server/actions/action';
import {verifyUser} from '@/server/modules/auth';
import UserService from '@/server/service/user.service';

export const getMyInfo = async () =>
  serverAction(async () => {
    const userService = new UserService();
    const tokenUser = await verifyUser();
    if (!tokenUser) {
      return null;
    }
    const user = await userService.getUser(tokenUser.id);
    return user;
  });

export const getUserInfo = async (id: number) =>
  serverAction(async () => {
    const userService = new UserService();
    const user = await userService.getUser(id);
    return user;
  });

export const changeUserInfo = async ({
  nickName,
  profileImage,
}: {
  nickName?: string;
  profileImage?: File;
}) =>
  serverAction(async () => {
    const userService = new UserService();
    const tokenUser = await verifyUser();
    if (!tokenUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const {id} = tokenUser;

    const {url} = profileImage
      ? await userService.uploadTempImage(profileImage)
      : {url: undefined};

    const user = await userService.updateUser(id, nickName, url);

    return user;
  });

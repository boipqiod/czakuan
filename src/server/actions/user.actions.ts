'use server';

import {serverAction} from '@/lib/actions';
import {TokenService} from '@/server/service/token.service';
import UserService from '@/server/service/user.service';

export const getUserInfo = serverAction(async () => {
  const service = new TokenService();
  const userService = new UserService();
  const tokenUser = await service.verifyCookieToken();
  if (!tokenUser) {
    return null;
  }
  const user = await userService.getUser(tokenUser.id);
  return user;
});

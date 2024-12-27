import {UnauthorizedError} from '@/server/Error';
import TokenService from '@/server/service/token.service';

export class AuthService {
  constructor(private readonly tokenService = new TokenService()) {}

  verifyUser = async () => {
    const user = await this.tokenService.verifyCookieToken();
    if (!user) {
      throw UnauthorizedError();
    }
    return user;
  };

  verifyUserId = async (userId: number) => {
    const user = await this.tokenService.verifyCookieToken();
    if (!user) {
      throw UnauthorizedError();
    }
    if (user.id !== userId) {
      throw UnauthorizedError();
    }
    return user;
  };

  verifyAdmin = async (text?: string) => {
    const user = await this.tokenService.verifyCookieToken();
    if (!user) {
      throw UnauthorizedError(text);
    }
    if (!user.role.includes('ADMIN')) {
      throw UnauthorizedError(text);
    }
    return user;
  };

  verifySuperAdmin = async () => {
    const user = await this.tokenService.verifyCookieToken();

    console.log('verifySuperAdmin', user);

    if (!user) {
      throw UnauthorizedError();
    }
    if (!user.role.includes('SUPER_ADMIN')) {
      throw UnauthorizedError();
    }
    return user;
  };

  verifyAdminOrOwner = async (userId: number) => {
    const user = await this.tokenService.verifyCookieToken();
    if (!user) {
      throw UnauthorizedError();
    }
    if (!user.role.includes('SUPER_ADMIN') && user.id !== userId) {
      throw UnauthorizedError();
    }
    return user;
  };
}

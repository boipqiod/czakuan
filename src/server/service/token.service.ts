import {User} from '@/types/user';
import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';

const TOKEN_NAME = '_t';
const REFRESH_TOKEN_NAME = '_rt';

export class TokenService {
  constructor(
    private readonly jwtSectet: string = process.env.JWT_SECRET as string,
  ) {}

  private async saveTokens(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();
    const _accessToken = accessToken.split('').toReversed().join('');
    const _refreshToken = refreshToken.split('').toReversed().join('');

    console.log('accessToken', _accessToken);
    console.log('refreshToken', _refreshToken);

    cookieStore.set(TOKEN_NAME, _accessToken);
    cookieStore.set(REFRESH_TOKEN_NAME, _refreshToken);
  }

  private async getTokens() {
    const cookieStore = await cookies();
    const _token = cookieStore.get(TOKEN_NAME);
    const _refreshToken = cookieStore.get(REFRESH_TOKEN_NAME);

    const token = _token ? _token.value.split('').toReversed().join('') : null;
    const refreshToken = _refreshToken
      ? _refreshToken.value.split('').toReversed().join('')
      : null;

    return {token, refreshToken};
  }

  async deleteTokens() {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_NAME);
    cookieStore.delete(REFRESH_TOKEN_NAME);
  }

  createToken(payload: any, expiresIn: string) {
    return jwt.sign(payload, this.jwtSectet, {expiresIn});
  }

  verifyToken(token: string) {
    return jwt.verify(token, this.jwtSectet);
  }

  createTokenByUser(user: User) {
    const payload = {
      id: user.id,
      role: user.role,
      nickName: user.nickName,
      profileImageUrl: user.profileImageUrl,
    };

    const accessToken = this.createToken(payload, '1m');
    const refreshToken = this.createToken(payload, '7d');

    return {accessToken, refreshToken};
  }

  async saveUserToken(user: User) {
    const {accessToken, refreshToken} = this.createTokenByUser(user);
    this.saveTokens(accessToken, refreshToken);
  }

  verifyAccessToken(token: string) {
    return this.verifyToken(token) as User;
  }

  async verifyCookieToken() {
    const {token, refreshToken} = await this.getTokens();
    if (!token || !refreshToken) {
      return null;
    }

    try {
      return this.verifyAccessToken(token);
    } catch (e) {
      const user = this.verifyAccessToken(refreshToken);
      if (!user) return null;
      this.saveUserToken(user);
      return user;
    }
  }
}

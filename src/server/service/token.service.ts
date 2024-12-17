import {User} from '@/types/user';
import jwt from 'jsonwebtoken';
import {cookies} from 'next/headers';

export class TokenService {
  constructor(
    private readonly jwtSectet: string = process.env.JWT_SECRET as string,
  ) {}

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

  verifyAccessToken(token: string) {
    return this.verifyToken(token) as User;
  }

  async verifyCookieToken() {
    const cookieStore = await cookies();

    const token = cookieStore.get('token');
    const refreshToken = cookieStore.get('refreshToken');
    if (!token || !refreshToken) {
      return null;
    }

    try {
      return this.verifyAccessToken(token.value);
    } catch (e) {
      const user = this.verifyAccessToken(refreshToken.value);
      if (!user) {
        return null;
      }
      const {accessToken: newAccessToken, refreshToken: newRefreshToken} =
        this.createTokenByUser(user);
      cookieStore.set('token', newAccessToken);
      cookieStore.set('refreshToken', newRefreshToken);

      return user;
    }
  }
}
